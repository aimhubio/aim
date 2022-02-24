# Hosting Aim on Kubernetes (K8S)

Since Aim can run as a local server through FastAPI, it can be deployed to a K8S cluster! Hosting Aim on K8S comes with
several advantages:

* multiple users of your organization can access Aim in a single spot, which removes the need for ML practitioners to
  run Aim themselves
* Aim runs can be centralized on a remote volume, which provides additional support and encouragement for remote model
  training and monitoring
* a deployment to K8S abstracts away the Aim CLI, which empowers users to focus on the value provided by Aim (
  visualizations/applications vs. CLI `up` and `repo` understanding)

The following sections illustrate how to deploy and serve Aim on K8S. The sections assume:

* access to a cloud provider, such as GCP, AWS, or Azure
* a repository that can host Dockerfiles, such as Google Artifact Registry or Dockerhub
* ability/permissions to provision a `ReadWriteMany` volume, or bind an existing one to a K8S deployment

## Dockerfile

The following Dockerfile image should suffice for getting Aim running in a container:

```Dockerfile
# python3.7 should be sufficient to run Aim
FROM python:3.7

# install the `aim` package on the latest version
RUN pip install --upgrade aim

# make a directory where the Aim repo will be initialized, `/aim`
RUN mkdir /aim

ENTRYPOINT ["/bin/sh", "-c"]

# have to run `aim init` in the directory that stores aim data for 
# otherwise `aim up` will prompt for confirmation to create the directory itself.
# We run aim listening on 0.0.0.0 to expose all ports. Also, we run 
# using `--dev` to print verbose logs. Port 43800 is the default port of 
# `aim up` but explicit is better than implicit.
CMD ["echo \"N\" | aim init --repo /aim && aim up --host 0.0.0.0 --port 43800 --workers 2 --repo /aim"]
```

Assuming you store the above in your current directory, the container can be built
using `docker build . -t my-aim-container:1` and pushed to your repository
with `docker push my-docker-repository.dev/deployments/aim:1`.

## Volume

The core advantage of using a K8S volume to store Aim runs is that other K8S deployments can mount the same volume and
store their runs on it! This way, the core Aim K8S deployment can read the new runs and display them to users who want
to visualize their results. For example, one can have a deployment that performs model training and records Aim runs on
the same volume that is mounted to the Aim deployment! This model is illustrated by the following diagram:

![](./basic_k8s_deployment_vol.png)

Generally, volumes that support have the `ReadWriteMany` property are manually provisioned, such as Filestore instances
on Google Cloud or, generally, GlusterFS volumes. Once a disk is provisioned, it can be bound to a persistent volume via
an IP. Assuming you can provision a disk like this on your cloud provider and obtain an IP, we can create a volume
representation, along with a claim for it. The persistent volume (`aim-pv.yaml`) can be formulated as:

```YAML
apiVersion: v1
kind: PersistentVolume
metadata:
  name: aim-runs
spec:
  capacity:
    storage: 1Ti # or whatever size disk you provisioned
  accessModes:
    - ReadWriteMany
  nfs:
    path: /aim
    server: 123.12.123.12  # add your own IP here
```

The persistent volume claim (`aim-pvc.yaml`) is:

```YAML
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: aim-runs-claim
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: "" # if you have a custom storage class, use it! Otherwise, it's `default`
  volumeName: aim-runs
  resources:
    requests:
      storage: 1Ti
```

These can be provisioned via:

```shell
> kubectl apply -f aim-pv.yaml
> kubectl apply -f aim-pvc.yaml
```

Once the volume is provisioned, we can mount it to our deployments!

## Deployment

The main Aim deployment will have a single container that runs Aim. This deployment will mount the volume that was
provisioned previously, and the main Aim repository will be initialized at the path the volume is mounted to. For
example, if the volume is mounted to `/aim`, then the deployment will initialize and read Aim runs from that path. The
K8S deployment is:

```YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: my-aim-deployment
  name: my-aim-deployment
  namespace: default
spec:
  selector:
    matchLabels:
      app: my-aim-deployment
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: my-aim-deployment
    spec:
      containers:
        image: my-docker-repository.dev/deployments/aim:1
        name: my-aim-deployment
        ports:
          - containerPort: 43800
            protocol: TCP
        resources:
          limits:
            cpu: "1"
            memory: 2Gi
          requests:
            cpu: 100m
            memory: 1Gi
        volumeMounts:
          - mountPath: /aim
            name: aim-runs
      volumes:
        - name: aim-runs
          persistentVolumeClaim:
            claimName: aim-runs-claim
```

This K8S deployment:

* defines a pod with a single replica that runs the Aim server defined by the Dockerfile
* mounts the persistent volume `aim-run` through the `aim-run-claim` persistent volume claim
* the Dockerfile initializes the `/aim` directory as the Aim repo. Note that the Dockerfile already passes `N` to the
  confirmation prompt in case the repo is already initialized (this will be the case after the initial deployment
  creation, since the repo has to be initialized only once, but it's nice to avoid manual work)
* starts up the Aim server on port 43800, which reads all the runs stored at `/aim`

## Service

Now that a deployment is deployed, the Aim server can be exposed through a K8S service! Depending on your cluster setup,
you have several options for exposing the deployment. One option is to run:

```shell
> kubectl expose deployment my-aim-deployment --type=LoadBalancer --name=my-aim-service
```

Another alternative is to create the service definition yourself, and apply it. The definition (`aim-svc.yaml`) can be:

```YAML
apiVersion: v1
kind: Service
metadata:
  name: my-aim-service
spec:
  selector:
    app: my-aim-deployment
  ports:
    - protocol: TCP
      port: 80
      targetPort: 43800
```

The service definition can be applied via:

```shell
> kubectl apply -f aim-svc.yaml
```

## Conclusion

That's it! Now you have the following structure serving your users' Aim runs:

![](./basic_k8s_deployment_final.png)

Assuming your users can submit a model training run to _some_ pod/deployment that runs model training and has the
right `aim` code to record a run at path `/aim`, your Aim deployment will be able to display the run the next time it
performs a live update!
