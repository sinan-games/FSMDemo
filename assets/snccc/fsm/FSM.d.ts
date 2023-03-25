declare module SN {
    namespace FSM {
        /**
         * 状态机接口
         */
        interface IStateMachine extends IState {
            /**
             * 当前状态
             */
            readonly activeState: IState;
            /**
             * 当前激活的状态id
             */
            readonly activeID: number;
            /**
             * 标记状态机能做状态跳转了
             */
            stateCanExit(): void;
            /**
             * 请求修改状态
             * @param id - 目标状态
             * @param data - 数据
             * @param forceInstantly - 立即执行
             */
            requestStateChange(
                id: number,
                data?: any,
                forceInstantly?: boolean
            ): any;
            /**
             * 停止状态机执行
             */
            stop(): any;
        }

        interface IState {
            /**
             * 是否是状态机，用于区分子状态机和状态
             */
            isStateMachine: boolean;
            /**
             * 状态运行的时间
             */
            readonly elapsedTime: number;
            /**
             * 是否需要等待退出
             */
            needExitTime: boolean;
            /**
             * 状态id
             */
            stateId: number;
            /**
             * 状态对应的状态机
             */
            fsm: IStateMachine;
            /**
             * 初始化状态
             */
            init(): any;
            /**
             * 进入状态
             * @param prevState - 上一个状态
             * @param param - 状态数据
             */
            onEnter(prevState: IState, param?: any): void;
            /**
             * 离开状态
             * @param nextState - 下一个状态
             * @param param - 数据
             */
            onExit(nextState: IState, param?: any): void;
            /**
             * 状态持续函数
             * @param dt - 时间间隔
             */
            onUpdate(dt: any): any;
            /**
             * 请求离开状态
             */
            requestExit(): any;
        }

        /**
         * 状态转换信息
         */
        interface ITransition {
            from: number;
            to: number;
            /**
             * 附加数据
             */
            data?: any;
            /**
             * 立即执行不等待完成
             */
            forceInstantly: boolean;
            /**
             * 状态机
             */
            fsm: IStateMachine;
            /**
             * 初始化
             */
            init(): any;
            /**
             * 开始进入尝试转换
             */
            onEnter(): any;
            /**
             * 是否可以状态转换
             */
            shouldTransition(): boolean;
        }

        /**
         * 基础状态
         */
        class StateBase implements IState {
            isStateMachine: boolean;
            private time;
            get elapsedTime(): number;
            needExitTime: boolean;
            stateId: number;
            fsm: IStateMachine;
            init(): void;
            onEnter(prevState: IState, param?: any): void;
            onExit(nextState: IState, param?: any): void;
            onUpdate(dt: any): void;
            requestExit(): void;
        }

        /**
         * 状态机一般基类
         */
        class State extends StateBase {
            private onEnterFunc;
            private onUpdateFunc;
            private onExitFunc;
            private canExitFunc;
            /**
             * 构造
             * @param onEnter - 进入状态回调
             * @param onUpdate - 状态执行回调
             * @param onExit - 状态退出回调
             * @param canExit - 是否能退出的函数
             * @param needExitTime - 是否需要等待回调
             */
            constructor(
                onEnter?: (
                    state: State,
                    prevState: IState,
                    param?: any
                ) => void,
                onUpdate?: (state: State, dt: number) => void,
                onExit?: (state: State, nextState: IState, param?: any) => void,
                canExit?: (state: State) => boolean,
                needExitTime?: boolean
            );
            onEnter(prevState: IState, param?: any): void;
            onExit(nextState: IState, param?: any): void;
            onUpdate(dt: any): void;
            requestExit(): void;
        }

        /**
         * 基础转换
         */
        class TransitionBase implements ITransition {
            from: number;
            to: number;
            forceInstantly: boolean;
            data: any;
            fsm: IStateMachine;
            /**
             * 构造
             * @param from - 当前状态名称
             * @param to - 目标名称
             * @param forceInstantly - 是否立即执行
             */
            constructor(
                from: number,
                to: number,
                forceInstantly?: boolean,
                data?: any
            );
            init(): void;
            onEnter(): void;
            shouldTransition(): boolean;
        }

        /**
         * 一个常规的状态转换，可以根据特定条件
         */
        class Transition extends TransitionBase {
            /**
             * 转换条件回调
             */
            condition: (tran: Transition) => boolean;
            /**
             * 构造
             * @param from -
             * @param to -
             * @param condition - 跳转条件
             * @param forceInstantly -
             * @param data -
             */
            constructor(
                from: number,
                to: number,
                condition: (tran: Transition) => boolean,
                forceInstantly?: boolean,
                data?: any
            );
            shouldTransition(): boolean;
        }

        /**
         * 根据时间实现自动跳转状态
         */
        class TransitionAfter extends Transition {
            /**
             * 需要等待的时间
             */
            delay: number;
            /**
             * 开始时间
             */
            private time;
            /**
             * 当前执行的时间
             */
            get runTime(): number;
            /**
             * 构造函数
             * @example
             * ```
             * let 东土大唐 = 0
             * let 西天 = 1
             * let 难 = 0
             * new TransitionAfter(东土大唐,西天,24*365*60*60,()=>难==9*9)
             * ```
             * @param from - 何处
             * @param to - 去往何方
             * @param delay - 时间
             * @param condition - 条件
             * @param forceInstantly - 是否强制
             * @param data - 附加信息
             */
            constructor(
                from: number,
                to: number,
                delay: number,
                condition?: (tran: Transition) => boolean,
                forceInstantly?: boolean,
                data?: any
            );
            onEnter(): void;
            shouldTransition(): boolean;
        }

        /**
         * 状态特殊信息
         */
        class StateBundle {
            /**
             * 状态
             */
            state: IState;
            /**
             * 当前状态对应的转换信息
             */
            transitions: Array<ITransition>;
            /**
             * 本状态对应的事件转换
             */
            triggerToTransitions: Map<string, Array<ITransition>>;
            /**
             * 添加一个转换
             * @param t - 转换信息
             */
            addTransition(t: ITransition): void;
            /**
             * 添加一个事件类型的转换
             * @param event - 事件
             * @param t - 转换信息
             */
            addTriggerTransition(event: string, t: ITransition): void;
        }
        /**
         * 状态机实现类
         */
        class StateMachine extends StateBase implements IStateMachine {
            isStateMachine: boolean;
            /**
             * 起始状态
             */
            protected startState: number;
            /**
             * 当前状态
             */
            protected mCurState: IState;
            /**
             * 当前状态的包装信息
             */
            protected curBundle: StateBundle;
            /**
             * 准备要进入的状态
             */
            private pendingState;
            /**
             * 任意动画转换信息
             */
            private transitionsFromAny;
            /**
             * 状态Bundle
             */
            private stateBundles;
            /**
             * 消息对应的任意转换
             */
            private triggerTransitionsFromAny;
            /**
             * 是否是根状态
             */
            private get isRootFsm();
            get activeState(): IState;
            get activeID(): number;
            constructor();
            /**
             * 设置开始状态
             * @param id - 开始状态id
             */
            setStartState(id: number): void;
            stateCanExit(): void;
            requestExit(): void;
            getRealActiveState(): IState;
            curStateNeedExitTime(): boolean;
            requestStateChange(
                id: number,
                param: number,
                forceInstantly: boolean
            ): void;
            stop(): void;
            init(): void;
            /**
             * 进入状态
             * @param prevState - 上一个状态
             * @param param - 状态数据
             */
            onEnter(prevState: IState, param?: any): void;
            /**
             * 离开状态
             * @param nextState - 下一个状态
             * @param param - 数据
             */
            onExit(nextState: IState, param?: any): void;
            /**
             * 状态持续函数
             * @param dt - 时间间隔
             */
            onUpdate(dt: any): void;
            /**
             * 添加一个状态到状态机
             * @param id - 状态id
             * @param state - 状态
             */
            addState(id: number, state: IState): this;
            /**
             * 添加一个状态到状态机
             * @param stateId - 状态id
             * @param onEnter - 状态进入
             * @param onUpdate - 状态执行
             * @param onExit - 状态退出
             * @param canExit - 状态是否能退出
             * @param needExitTime - 状态是否需要等待退出
             * @returns
             */
            addStateFunc(
                stateId: number,
                onEnter?: (
                    state: State,
                    prevState: IState,
                    param?: any
                ) => void,
                onUpdate?: (state: State, dt: number) => void,
                onExit?: (state: State, nextState: IState, param?: any) => void,
                canExit?: (state: State) => boolean,
                needExitTime?: boolean
            ): this;
            /**
             * 添加跳转
             * @param from -
             * @param to -
             * @param condition - 条件
             * @param forceInstantly - 是否强制
             * @param data - 数据
             */
            addTransition(
                from: number,
                to: number,
                condition?: (ITransition: any) => boolean,
                forceInstantly?: boolean,
                data?: any
            ): any;
            /**
             * 添加跳转
             * @param t - 跳转信息
             */
            addTransition(t: ITransition): any;
            /**
             * 添加任意状态跳转
             * @param t - 跳转信息
             */
            addTransitionFromAny(t: ITransition): any;
            /**
             * 添加一个任意类型的跳转
             * @param to - 目标
             * @param condition - 条件
             * @param forceInstantly - 是否强制
             * @param data - 数据
             * @returns
             */
            addTransitionFromAny(
                to: number,
                condition?: (ITransition: any) => boolean,
                forceInstantly?: boolean,
                data?: any
            ): any;
            /**
             * 添加事件类型的转换
             * @param event - 事件
             * @param t - 转换信息
             * @returns
             */
            addTriggerTransition(event: string, t: ITransition): any;
            /**
             * 添加事件类型的转换
             * @param event - 事件
             * @param from -
             * @param to - 目标
             * @param condition - 条件
             * @param forceInstantly - 是否立即执行
             * @param data -  附加数据
             */
            addTriggerTransition(
                event: string,
                from: number,
                to: number,
                condition?: (ITransition: any) => boolean,
                forceInstantly?: boolean,
                data?: any
            ): any;
            /**
             * 添加任意事件类型的转换
             * @param event - 事件类型
             * @param t - 转换信息
             * @param data - 附加数据
             */
            addTriggerTransitionFromAny(event: string, t: ITransition): any;
            addTriggerTransitionFromAny(
                event: string,
                to: number,
                condition?: (ITransition: any) => boolean,
                forceInstantly?: boolean,
                data?: any
            ): any;
            /**
             * 触发事件类型的状态转换
             * @param event - 事件类型
             * @param data - 事件数据
             */
            trigger(event: string, data?: any): boolean;
            /**
             * 改变状态
             * @param id - 状态id
             * @param param - 状态跳转参数
             */
            changeState(id: number, param?: any): void;
            private initTransition;
            private getOrCreateStateBundle;
            private createOptimizedTransition;
            private tryTransition;
        }

        export {
            IState,
            IStateMachine,
            ITransition,
            State,
            StateBase,
            StateMachine,
            Transition,
            TransitionAfter,
            TransitionBase,
        };
    }
}
