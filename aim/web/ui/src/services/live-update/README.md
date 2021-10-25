## Usage

````js
    // to describe webpack as this is a worker file
    import LUWorker from 'comlink-loader!./services/live-update/Worker';
    import { getDataFromTransferable } from 'services/live-update'
    import * as Comlink from 'comlink';
    
    function initizeWorker(subscriber) {
        let worker =  new LUWorker();
        
        // set config [name, uri, delay, enableLog]
        worker.setConfig('Runs', 'runs/search/run', 1000, true);
        worker.subscribeToApiCallResult(
            // if subscriber has a context, please bind to the context
            Comlink.proxy(subscriber),
        );
        
        return worker;
    }
    
    const subscriber = (data) => {
        const obj = getDataFromTransferable(data);
        console.log("DATA --- ", obj);
        
        // send to render
    }
    
    const w = initizeWorker(subscriber);
    
    w.start({ q: 'test', limit: 50 })
    // some condition
    w.stop().then().catch()// will pause to call
    // some condition
    // w.start({ q: 'test1', limit: 60 }).then().catch() 
    
   // to terminate
   w.close();
````