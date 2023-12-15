import { reactive } from 'vue';

export const eventHub = reactive<any>({});

// 提供一个函数用于触发事件
function emit(eventName:string, data:any) {
    const callback = eventHub[eventName]
    if (callback && callback.length) {
        callback.forEach((cb:any) => {
            cb(data);
        });
    }
}

// 提供一个函数用于监听事件
function on(eventName:string, callback:any) {
    if (!eventHub[eventName]) {
        eventHub[eventName] = [];
    }
    const existingCallbacks = eventHub[eventName];
    existingCallbacks.push(callback);

    // 返回一个取消订阅的函数
    return () => {
        const index = existingCallbacks.indexOf(callback);
        if (index > -1) {
            existingCallbacks.splice(index, 1);
        }
    }
}

// 将 emit 和 on 方法挂载到 eventHub 上
eventHub.emit = emit;
eventHub.on = on;

export default eventHub;