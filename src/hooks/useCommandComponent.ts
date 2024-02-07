// 导入相关模块
import { AppContext, Component, ComponentPublicInstance, createVNode, getCurrentInstance, render, VNode } from 'vue';

// 定义Options接口，用于传递参数
export interface Options {
    visible?: boolean; // 可选参数，表示是否可见，默认为true
    onClose?: () => void; // 表示关闭时的回调函数
    appendTo?: HTMLElement | string; // 表示将弹窗附加到的元素，默认为document.body
    [key: string]: unknown; // 表示可额外传递其他键值对参数
}

// 定义CommandComponent接口，用于创建组件和关闭弹窗
export interface CommandComponent {
    (options: Options): VNode; // 根据Options参数创建VNode
    close: () => void; // 关闭弹窗
}

// 获取appendTo参数指定的元素，并返回其实例
const getAppendToElement = (props: Options): HTMLElement => {
    let appendTo: HTMLElement | null = document.body; // 将appendTo初始化为document.body

    // 判断appendTo参数的类型，并赋值给appendTo变量
    if (props.appendTo) {
        if (typeof props.appendTo === 'string') {
            appendTo = document.querySelector<HTMLElement>(props.appendTo);
        }
        if (props.appendTo instanceof HTMLElement) {
            appendTo = props.appendTo;
        }
        if (!(appendTo instanceof HTMLElement)) {
            appendTo = document.body;
        }
    }

    return appendTo;
};

// 初始化组件并返回VNode实例
const initInstance = <T extends Component>(
    Component: T,
    props: Options,
    children: any,
    container: HTMLElement,
    appContext: AppContext | null = null
) => {
    const vNode = createVNode(Component, props, children); // 创建VNode
    vNode.appContext = appContext; // 设置vNode的appContext属性
    render(vNode, container); // 渲染组件到container中

    getAppendToElement(props).appendChild(container); // 将container添加到appendTo元素中
    return vNode;
};

// 使用useCommandComponent命令
export const useCommandComponent = <T extends Component>(Component: T): CommandComponent => {
    const appContext = getCurrentInstance()?.appContext; // 获取当前实例的appContext

    // 将当前实例的provides对象合并到appContext.provides对象中
    if (appContext) {
        const currentProvides = (getCurrentInstance() as any)?.provides;
        Reflect.set(appContext, 'provides', { ...appContext.provides, ...currentProvides });
    }

    const container = document.createElement('div'); // 创建一个div元素作为container

    // 关闭弹窗
    const close = () => {
        render(null, container); // 清空container中的组件
        container.parentNode?.removeChild(container); // 移除container元素
    };

    // 根据Options参数创建CommandComponent
    const CommandComponent = (options: Options, children:any): VNode => {
        if (!Reflect.has(options, 'visible')) {
            options.visible = true; // 如果options中没有visible属性，则默认设置为true
        }
        if (typeof options.onClose !== 'function') {
            options.onClose = close; // 如果options中没有onClose属性，则设置为关闭弹窗的回调函数
        } else {
            const originOnClose = options.onClose;
            options.onClose = () => {
                originOnClose(); // 调用原始的onClose回调函数
                close(); // 关闭弹窗
            };
        }

        const vNode = initInstance<T>(Component, options, children, container, appContext); // 初始化组件并返回VNode实例
        const vm = vNode.component?.proxy as ComponentPublicInstance<Options>; // 获取组件的代理对象

        // 将Options参数中除visible和onClose以外的其他属性传递给组件
        for (const prop in options) {
            if (Reflect.has(options, prop) && !Reflect.has(vm.$props, prop)) {
                vm[prop as keyof ComponentPublicInstance] = options[prop];
            }
        }

        return vNode;
    };

    CommandComponent.close = close; // 设置CommandComponent的close属性为关闭弹窗的回调函数

    return CommandComponent; // 返回CommandComponent
};

// 默认导出useCommandComponent函数
export default useCommandComponent;
