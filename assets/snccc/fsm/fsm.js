"use strict";

window.SN = window.SN || {};
window.SN.FSM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    State: () => State,
    StateBase: () => StateBase,
    StateMachine: () => StateMachine,
    Transition: () => Transition,
    TransitionAfter: () => TransitionAfter,
    TransitionBase: () => TransitionBase
  });

  // src/state/StateBase.ts
  var StateBase = class {
    constructor() {
      this.isStateMachine = false;
      this.time = 0;
      this.needExitTime = false;
    }
    get elapsedTime() {
      return this.time;
    }
    init() {
    }
    onEnter(prevState, param) {
      this.time = 0;
    }
    onExit(nextState, param) {
    }
    onUpdate(dt) {
      this.time += dt;
    }
    requestExit() {
      if (!this.needExitTime)
        this.fsm.stateCanExit();
    }
  };

  // src/state/State.ts
  var State = class extends StateBase {
    /**
     * 构造
     * @param onEnter - 进入状态回调
     * @param onUpdate - 状态执行回调
     * @param onExit - 状态退出回调
     * @param canExit - 是否能退出的函数
     * @param needExitTime - 是否需要等待回调
     */
    constructor(onEnter = null, onUpdate = null, onExit = null, canExit = null, needExitTime = false) {
      super();
      this.needExitTime = needExitTime;
      this.onEnterFunc = onEnter;
      this.onUpdateFunc = onUpdate;
      this.onExitFunc = onExit;
      this.canExitFunc = canExit;
    }
    onEnter(prevState, param) {
      super.onEnter(prevState, param);
      if (this.onEnterFunc)
        this.onEnterFunc(this, prevState, param);
    }
    onExit(nextState, param) {
      super.onExit(nextState, param);
      if (this.onExitFunc)
        this.onExitFunc(this, nextState, param);
    }
    onUpdate(dt) {
      super.onUpdate(dt);
      if (this.onUpdateFunc)
        this.onUpdateFunc(this, dt);
    }
    requestExit() {
      if (!this.needExitTime || this.canExitFunc && this.canExitFunc(this)) {
        this.fsm.stateCanExit();
      }
    }
  };

  // src/transition/TransitionBase.ts
  var TransitionBase = class {
    /**
     * 构造
     * @param from - 当前状态名称
     * @param to - 目标名称
     * @param forceInstantly - 是否立即执行
     */
    constructor(from, to, forceInstantly = false, data = null) {
      this.from = from;
      this.to = to;
      this.forceInstantly = forceInstantly;
      this.data = data;
    }
    init() {
    }
    onEnter() {
    }
    shouldTransition() {
      return true;
    }
  };

  // src/transition/Transition.ts
  var Transition = class extends TransitionBase {
    /**
     * 构造
     * @param from - 
     * @param to - 
     * @param condition - 跳转条件
     * @param forceInstantly - 
     * @param data - 
     */
    constructor(from, to, condition, forceInstantly = false, data = null) {
      super(from, to, forceInstantly, data);
      this.condition = condition;
    }
    shouldTransition() {
      if (this.condition)
        return this.condition(this);
      return super.shouldTransition();
    }
  };

  // src/transition/TransitionAfter.ts
  var TransitionAfter = class extends Transition {
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
    constructor(from, to, delay, condition = null, forceInstantly = false, data = null) {
      super(from, to, condition, forceInstantly, data);
      this.delay = delay;
      this.time = Date.now();
    }
    /**
     * 当前执行的时间
     */
    get runTime() {
      return (Date.now() - this.time) * 1e-3;
    }
    onEnter() {
      this.time = Date.now();
    }
    shouldTransition() {
      if (this.runTime < this.delay)
        return false;
      return this.condition == null || this.condition(this);
    }
  };

  // src/StateMachine.ts
  var StateBundle = class {
    /**
     * 添加一个转换
     * @param t - 转换信息
     */
    addTransition(t) {
      if (!this.transitions)
        this.transitions = [];
      if (this.transitions.indexOf(t) == -1)
        this.transitions.push(t);
    }
    /**
     * 添加一个事件类型的转换
     * @param event - 事件
     * @param t - 转换信息
     */
    addTriggerTransition(event, t) {
      if (!this.triggerToTransitions)
        this.triggerToTransitions = /* @__PURE__ */ new Map();
      let arr;
      if (this.triggerToTransitions.has(event)) {
        arr = this.triggerToTransitions.get(event);
      } else {
        arr = [];
        this.triggerToTransitions.set(event, arr);
      }
      if (arr.indexOf(t) == -1)
        arr.push(t);
    }
  };
  var StateMachine = class extends StateBase {
    constructor() {
      super();
      this.isStateMachine = true;
      /**
       * 起始状态
       */
      this.startState = -1;
      /**
       * 准备要进入的状态
       */
      this.pendingState = { id: -1, data: null };
      /**
       * 任意动画转换信息
       */
      this.transitionsFromAny = [];
      /**
       * 状态Bundle
       */
      this.stateBundles = /* @__PURE__ */ new Map();
      /**
       * 消息对应的任意转换
       */
      this.triggerTransitionsFromAny = /* @__PURE__ */ new Map();
    }
    /**
     * 是否是根状态
     */
    get isRootFsm() {
      return this.fsm == null;
    }
    get activeState() {
      return this.mCurState;
    }
    get activeID() {
      return this.activeState ? this.activeState.stateId : -1;
    }
    /**
     * 设置开始状态
     * @param id - 开始状态id
     */
    setStartState(id) {
      this.startState = id;
    }
    stateCanExit() {
      if (this.pendingState.id != -1) {
        this.changeState(this.pendingState.id, this.pendingState.data);
        this.pendingState.id = -1;
        this.pendingState.data = null;
      } else {
      }
      if (this.fsm)
        this.fsm.stateCanExit();
    }
    requestExit() {
      let realState = this.getRealActiveState();
      if (realState && realState.needExitTime)
        realState.requestExit();
      else
        this.fsm.stateCanExit();
    }
    getRealActiveState() {
      if (!this.activeState) {
        return null;
      }
      let nowState = this.activeState;
      while (true) {
        if (nowState && nowState.isStateMachine) {
          nowState = nowState.activeState;
        } else {
          break;
        }
      }
      if (nowState) {
        return nowState;
      } else {
        return null;
      }
    }
    curStateNeedExitTime() {
      let realState = this.getRealActiveState();
      if (realState) {
        return realState.needExitTime;
      } else {
        return false;
      }
    }
    requestStateChange(id, param, forceInstantly) {
      if (!this.activeState || !this.curStateNeedExitTime() || forceInstantly) {
        this.changeState(id, param);
      } else {
        this.pendingState.id = id;
        this.pendingState.data = param;
        if (this.activeState != null) {
          this.activeState.requestExit();
        }
      }
    }
    stop() {
      if (this.pendingState.id != -1) {
        this.pendingState.id = -1;
        this.pendingState.data = null;
      }
      if (this.mCurState != null) {
        this.mCurState.onExit(null);
        this.mCurState = null;
        this.curBundle = null;
      }
    }
    init() {
      if (this.isRootFsm)
        this.onEnter(null);
    }
    /**
     * 进入状态
     * @param prevState - 上一个状态 
     * @param param - 状态数据
     */
    onEnter(prevState, param) {
      this.changeState(this.startState, param);
      for (let index = 0; index < this.transitionsFromAny.length; index++) {
        const t = this.transitionsFromAny[index];
        t.onEnter();
      }
      this.triggerTransitionsFromAny.forEach((element) => {
        element.forEach((v) => {
          v.onEnter();
        });
      });
    }
    /**
     * 离开状态
     * @param nextState - 下一个状态 
     * @param param - 数据
     */
    onExit(nextState, param) {
      if (this.activeState != null) {
        this.mCurState.onExit(null, param);
        this.mCurState = null;
        this.curBundle = null;
      }
    }
    /**
     * 状态持续函数
     * @param dt - 时间间隔
     */
    onUpdate(dt) {
      if (this.activeState) {
        for (let index = 0; index < this.transitionsFromAny.length; index++) {
          const t = this.transitionsFromAny[index];
          if (t.to == this.activeState.stateId)
            continue;
          if (this.tryTransition(t))
            break;
        }
        if (this.mCurState && this.curBundle) {
          if (this.curBundle.transitions) {
            for (let index = 0; index < this.curBundle.transitions.length; index++) {
              const t = this.curBundle.transitions[index];
              if (this.tryTransition(t))
                break;
            }
          }
          if (this.mCurState)
            this.mCurState.onUpdate(dt);
        }
      }
    }
    /**
     * 添加一个状态到状态机
     * @param id - 状态id
     * @param state - 状态
     */
    addState(id, state) {
      state.fsm = this;
      state.stateId = id;
      state.init();
      let bundle = this.getOrCreateStateBundle(id);
      bundle.state = state;
      if (this.startState == -1)
        this.setStartState(id);
      return this;
    }
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
    addStateFunc(stateId, onEnter = null, onUpdate = null, onExit = null, canExit = null, needExitTime = false) {
      if (onEnter == null && onUpdate == null && onExit == null && canExit == null) {
        this.addState(stateId, new StateBase());
      } else {
        this.addState(stateId, new State(onEnter, onUpdate, onExit, canExit, needExitTime));
      }
      return this;
    }
    addTransition() {
      let addTran = (t) => {
        this.initTransition(t);
        let bundle = this.getOrCreateStateBundle(t.from);
        bundle.addTransition(t);
      };
      if (arguments.length == 1) {
        addTran(arguments[0]);
      } else {
        let from = arguments[0];
        let to = arguments[1];
        let condition = arguments.length > 2 ? arguments[2] : null;
        let forceInstantly = arguments.length > 3 ? arguments[3] : false;
        let data = arguments.length > 4 ? arguments[4] : null;
        addTran(this.createOptimizedTransition(from, to, condition, forceInstantly, data));
      }
      return this;
    }
    addTransitionFromAny(...args) {
      let t;
      if (typeof args[0] == "number") {
        let to = args[0];
        let condition = args.length > 1 ? args[1] : null;
        let forceInstantly = args.length > 2 ? args[2] : false;
        let data = args.length > 3 ? args[3] : null;
        t = this.createOptimizedTransition(-1, to, condition, forceInstantly, data);
      } else {
        t = args[0];
      }
      this.initTransition(t);
      if (this.transitionsFromAny.indexOf(t) == -1)
        this.transitionsFromAny.push(t);
      return this;
    }
    addTriggerTransition(...args) {
      let event = args[0];
      let t;
      if (typeof args[1] == "number") {
        let from = args[1];
        let to = args[2];
        let condition = args.length > 3 ? args[3] : null;
        let forceInstantly = args.length > 4 ? args[4] : false;
        let data = args.length > 5 ? args[5] : false;
        t = this.createOptimizedTransition(from, to, condition, forceInstantly, data);
      } else {
        t = args[1];
      }
      this.initTransition(t);
      let bundle = this.getOrCreateStateBundle(t.from);
      bundle.addTriggerTransition(event, t);
      return this;
    }
    addTriggerTransitionFromAny(...args) {
      let event = args[0];
      let t;
      if (typeof args[1] == "number") {
        let to = args[1];
        let condition = args.length > 2 ? args[2] : null;
        let forceInstantly = args.length > 3 ? args[3] : false;
        t = this.createOptimizedTransition(-1, to, condition, forceInstantly);
      } else {
        t = args[1];
      }
      this.initTransition(t);
      let transitionsOfTrigger;
      if (this.triggerTransitionsFromAny.has(event))
        transitionsOfTrigger = this.triggerTransitionsFromAny.get(event);
      else {
        transitionsOfTrigger = [];
        this.triggerTransitionsFromAny.set(event, transitionsOfTrigger);
      }
      transitionsOfTrigger.push(t);
    }
    /**
     * 触发事件类型的状态转换
     * @param event - 事件类型
     * @param data - 事件数据
     */
    trigger(event, data) {
      let ret = false;
      if (this.triggerTransitionsFromAny.has(event)) {
        let triggerTransitions = this.triggerTransitionsFromAny.get(event);
        for (let index = 0; index < triggerTransitions.length; index++) {
          const transition = triggerTransitions[index];
          if (this.activeID != -1 && transition.to == this.activeID)
            continue;
          if (this.tryTransition(transition, data)) {
            ret = true;
            break;
          }
        }
      }
      if (!ret) {
        if (this.activeState) {
          let bundle = this.stateBundles.get(this.activeState.stateId);
          if (bundle && bundle.triggerToTransitions && bundle.triggerToTransitions.has(event)) {
            let ts = bundle.triggerToTransitions.get(event);
            for (let index = 0; index < ts.length; index++) {
              const t = ts[index];
              ret = this.tryTransition(t, data);
              if (ret)
                break;
            }
          }
        }
      }
      if (!ret && this.activeState) {
        if (this.activeState["trigger"]) {
          this.activeState["trigger"](event);
        }
      }
      return ret;
    }
    /**
     * 改变状态
     * @param id - 状态id
     * @param param - 状态跳转参数
     */
    changeState(id, param = null) {
      let nextStateBundle = this.stateBundles.has(id) ? this.stateBundles.get(id) : null;
      if (!nextStateBundle)
        console.warn(`\u9700\u8981\u8DF3\u8F6C\u5230\u7684\u72B6\u6001:[${id}]\u4E0D\u5B58\u5728,\u7EF4\u6301\u73B0\u5728\u72B6\u6001\u4E0D\u53D8`);
      else {
        let last = this.activeState;
        if (last)
          last.onExit(nextStateBundle.state, param);
        this.mCurState = nextStateBundle.state;
        this.mCurState.onEnter(last, param);
        this.curBundle = nextStateBundle;
        if (nextStateBundle.transitions) {
          for (let index = 0; index < nextStateBundle.transitions.length; index++) {
            const t = nextStateBundle.transitions[index];
            t.onEnter();
          }
        }
        if (nextStateBundle.triggerToTransitions) {
          nextStateBundle.triggerToTransitions.forEach((values) => {
            values.forEach((t) => {
              t.onEnter();
            });
          });
        }
      }
    }
    initTransition(t) {
      t.fsm = this;
      t.init();
    }
    getOrCreateStateBundle(stateId) {
      let bundle;
      if (this.stateBundles.has(stateId))
        bundle = this.stateBundles.get(stateId);
      else {
        bundle = new StateBundle();
        this.stateBundles.set(stateId, bundle);
      }
      return bundle;
    }
    createOptimizedTransition(from, to, condition = null, forceInstantly = false, data = null) {
      if (condition) {
        return new Transition(from, to, condition, forceInstantly, data);
      } else {
        return new TransitionBase(from, to, forceInstantly, data);
      }
    }
    tryTransition(t, data) {
      let flag = t.shouldTransition();
      if (flag) {
        this.requestStateChange(t.to, data || t.data, t.forceInstantly);
      }
      return flag;
    }
  };
  return __toCommonJS(src_exports);
})();
