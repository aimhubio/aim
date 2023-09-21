## Set up Aim remote tracking on Kubernetes (K8S) 

Aim introduced [Remote Tracking (RT)](../remote_tracking.md) starting from version `3.4.0`. It allows running experiments in a multi-host environment and collect tracked data in a centralized location.
Aim RT server as well as client script can be easily deployed to a K8S cluster! Hosting Aim RT on K8S comes with
several advantages:

* multiple users of your organization can ac cess Aim in a single spot, which removes the need for ML practitioners to
  run Aim themselves
* Aim runs can be centralized on the Remote Tracking server, which provides additional support and encouragement for remote model
  training and monitoring

The following sections demonstrates how to deploy Aim RT server and client on K8S.
The Aim RT based on [gRPC](https://grpc.io/about/) protocol and this sections also illustrate hot route traffic to a gRPC service through the Ingress-NGINX controller.

The sections assume:

* a repository that can host Dockerfiles, such as Google Artifact Registry or Dockerhub
* a kubernetes cluster running, with
  * an ingress-nginx-controller installed
* a domain name such as `rt-example.aimstack.io` that is configured to route traffic to the Ingress-NGINX controller.
* an SSL certificate for the ingress. So you need to have a valid SSL certificate, deployed as a Kubernetes secret of type tls, in the same namespace as the gRPC application.

### Dockerfile

The following Dockerfile image should suffice for getting Aim RT server running in a container:

```Dockerfile
# See aim docker hub documentation https://hub.docker.com/r/aimstack/aim
FROM aimstack/aim:latest

# We run aim listening on 0.0.0.0 to expose all ports.
# Port 53800 is the default port of `aim server` but explicit is better than implicit.
CMD yes | aim server --host 0.0.0.0 --port 53800
```

Assuming you store the above in your current directory, the container can be built
using `docker build . -t aim-server-container:1` and pushed to your repository
with `docker push my-docker-repository.dev/deployments/aim-server:1`.

### Deployment

The main Aim deployment will have a single container that runs Aim RT Server.
This deployment will use docker file defined previously.
K8S deployment is:

```YAML
# aim-server-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: aim-server
  name: aim-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aim-server
  template:
    metadata:
      labels:
        app: aim-server
    spec:
      containers:
      - image: my-docker-repository.dev/deployments/aim-server:1
        name: aim-server
        ports:
        - containerPort: 53800
```

This K8S deployment:

* defines a pod with a single replica that runs the Aim remote tracker server defined by the Dockerfile
* starts up the Aim server on port 53800.

You can save the above example manifest to a file with name `aim-server-deploy.yaml`.
You can create the k8s deployment with a kubectl command like this:

```shell
$ kubectl apply -f aim-server-deploy.yaml
```

### Service

The AIM service can use the following manifest to create a service of type ClusterIP.

```YAML
# aim-server-service.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: aim-server
  name: aim-server
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 53800
  selector:
    app: aim-server
  type: ClusterIP
```

The service definition can be applied via:

```shell
$ kubectl create -f aim-server-service.yaml
```

### Ingress

We need to create the Kubernetes Ingress resource for the `aim server` which is actually gRPC app.
Use the following example manifest of an ingress resource to create an ingress for `aim server`.
Make sure you have the required SSL-Certificate (`aim-server-tls`), existing in your Kubernetes cluster in the same namespace where the `aim server` is.
The certificate must be available as a kubernetes secret resource, of type "kubernete.io/tls".
We need SSL-Certificate here because we are terminating TLS on the ingress.

```YAML
# aim-server-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "GRPC"
  name: fortune-ingress
  namespace: default
spec:
  ingressClassName: nginx
  rules:
  - host: rt-example.aimstack.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: aim-server
            port:
              number: 80
  tls:
  - secretName: aim-server-tls
    hosts:
      - rt-example.aimstack.io
```

If you save the above example manifest as a file named `aim-server-ingress.yaml`, you can create the ingress like this:

```shell
$ kubectl create -f ingress.go-grpc-greeter-server.yaml
```
* Note that we are not doing any TLS configuration on the server, because we are terminating TLS at the ingress level, gRPC traffic will travel unencrypted inside the cluster and arrive "insecure".
* The ingress are tagged with the annotation nginx.ingress.kubernetes.io/backend-protocol: "GRPC". This sets up the nginx to route http/2 traffic to `aim service`.
* We are terminating TLS at the ingress and have configured an SSL certificate `aim-server-tls`.
  * The ingress matches traffic arriving as https://rt-example.aimstack.io:443 and routes unencrypted messages to the aim Kubernetes service.

### Client

Now you are ready to create aim client pod to track your experiment results.

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: my-super-aim-client
spec:
  containers:
  - name: my-super-aim-client
    image: my-super-aim-client
    env:
      - name: __AIM_CLIENT_SSL_CERTIFICATE__
        valueFrom:
          secretKeyRef:
            name: aim-server-tls
            key: cert
```

The `aim.Run` uses `__AIM_CLIENT_SSL_CERTIFICATE__` environment variable for secure channel establishment; it's a PEM-encoded root certificate.

