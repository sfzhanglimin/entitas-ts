module entitas {

  import ISystem = entitas.ISystem;
  import ReactiveSystem = entitas.ReactiveSystem;
  import IExecuteSystem = entitas.IExecuteSystem;
  import IInitializeSystem = entitas.IInitializeSystem;

  /**
   * As
   * Retuns the object if it implements the interface, else null
   *
   * @param object
   * @param method
   * @returns Object
   */
  function as(object, method:string) {
    return method in object ? object : null;
  }

  export class Systems implements IInitializeSystem, IExecuteSystem {

    protected _initializeSystems:Array<IInitializeSystem>;
    protected _executeSystems:Array<IExecuteSystem>;

    /**
     * @constructor
     *
     */
    constructor() {
      this._initializeSystems = [];
      this._executeSystems = [];
      /**
       * Load Extensions
       */
    }

    public add(system:ISystem);
    public add(system:Function);

    /**
     * Add System
     * @param system
     * @returns {entitas.Systems}
     */
    public add(system) {

      if ('function' === typeof system) {
        var Klass:any = system;
        system = new Klass();
      }

      var reactiveSystem = as(system, 'subsystem');
      var initializeSystem = reactiveSystem != null
          ? as(reactiveSystem.subsystem, 'initialize')
          : as(system, 'initialize');

      if (initializeSystem != null) {
        var _initializeSystems = this._initializeSystems;
        _initializeSystems[_initializeSystems.length] = initializeSystem;
      }

      var executeSystem:IExecuteSystem = as(system, 'execute');
      if (executeSystem != null) {
        var _executeSystems = this._executeSystems;
        _executeSystems[_executeSystems.length] = executeSystem;
      }

      return this;
    }

    /**
     * Initialize Systems
     */
    public initialize() {
      for (var i = 0, initializeSysCount = this._initializeSystems.length; i < initializeSysCount; i++) {
        this._initializeSystems[i].initialize();
      }
    }

    /**
     * Execute sustems
     */
    public execute() {
      var executeSystems = this._executeSystems;
      for (var i = 0, exeSysCount = executeSystems.length; i < exeSysCount; i++) {
        executeSystems[i].execute();
      }
    }


    /**
     * Clear subsystems
     */
    public clearReactiveSystems() {
      for (var i = 0, exeSysCount = this._executeSystems.length; i < exeSysCount; i++) {
        var reactiveSystem = as(this._executeSystems[i], 'subsystem');
        if (reactiveSystem != null) {
          reactiveSystem.clear();
        }

        var nestedSystems:Systems = as(this._executeSystems[i], 'clearReactiveSystems');
        if (nestedSystems != null) {
          nestedSystems.clearReactiveSystems();
        }
      }

    }

  }
}