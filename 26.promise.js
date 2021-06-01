class Promise {
    constructor(executor){
        const self = this;
        self.PromiseState = 'pending';
        self.PromiseResult = null;
        self.callback = [];

        // 执行期函数是同步调用的
        function resolve(data){
            if (self.PromiseState !== 'pending') return;
            //1. 修改对象的状态
            self.PromiseState = 'fulfilled';
            //2。设置对象结果值
            self.PromiseResult = data;
            //遍历每一个resolve方法
            if (self.callback.length > 0) {
                setTimeout(() => {
                    self.callback.forEach(item => {
                        item.onResolved(data);
                    })
                })
            }
        }

        function reject(data){
            if (self.PromiseState !== 'pending') return;
            //1. 修改对象的状态
            self.PromiseState = 'rejected';
            //2. 设置对象结果值
            self.PromiseResult = data;
            //遍历每一个reject方法
            if (self.callback.length > 0) {
                setTimeout(() => {
                    self.callback.forEach(item => {
                        item.onRejected(data);
                    })
                })
            }
        }
        try {
            executor(resolve, reject)
        } catch(error) { // 如果执行器抛出异常，promise对象变成rejected状态
            reject(error)
        }
    }

    then (onResolved, onRejected) {
        const self = this
        if(typeof onRejected !== 'function'){
            onRejected = (reason) =>{throw reason;}
        }
        if(typeof onResolved !== 'function'){
            onResolved = (value) => {return value;}
        }
        return new Promise((resolve, reject) => {
            function callback(type) {
                try {
                    let result = type(self.PromiseResult)
                    if (result instanceof Promise) {
                        result.then(v => {resolve(v)}, r => {reject(r)})
                    } else {
                        resolve(result)
                    }
                }catch (e) {
                    reject(e)
                }
            }
            if (self.PromiseState === 'fulfilled') {
                callback(onResolved)
            }
            if (self.PromiseState === 'rejected') {
                callback(onRejected)
            }
            if (self.PromiseState === 'pending') {
                // 保存回调函数
                /*
                因为Promise内部的函数是异步函数，
                所以执行到p.then的时候，
                p的状态还是pending，
                所以要加一个逻辑处理pending。
                并且保存下回调函数
             */
                self.callback.push({
                    onResolved: (value)=> {
                        callback(onResolved)
                    },
                    onRejected: (reason)=> {
                        callback(onRejected)
                    }
                })
            }
        })
    }
    catch (onRejected) {
        return this.then(undefined, onRejected)
    }
    static resolve (value) {
        return new Promise((resolve, reject) =>{
            if (value instanceof Promise){
                value.then(v=>{resolve(v);}, r=>{reject(r);})
            }else{
                resolve(value);
            }
        })
    }
    static reject (reason) {
        return new Promise((resolve, reject)=>{
            reject(reason)
        })
    }
    static all (promises){
        p = new Promise((resolve, reject)=>{
            let count = 0;
            let arr = new Array(promises.length);
            for(let i=0; i< promises.length;i++){
                promises[i].then(v=>{
                    if(i===0){
                        console.log("wait")
                    }
                    console.log("成功"+i+", value="+v)
                    count ++;
                    arr[i] = v;
                    if (count === promises.length){
                        resolve(arr);
                    }
                }, r=>{
                    reject(r);
                });
            }
        })
        console.log(p)
        return p
    }
    static race(promises){
        return new Promise((resolve, reject)=>{
            let count = 0;
            let arr = new Array(promises.length);
            for(let i=0; i< promises.length;i++){
                promises[i].then(v=>{
                    resolve(v);
                }, r=>{
                    reject(r);
                });
            }
        })
    }

}