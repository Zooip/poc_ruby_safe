class PasswordDerivator {

  memoise(name,constructor) {
    this.memoizedCache[name] = this.memoizedCache[name] || constructor();
    return this.memoizedCache[name]
  }

  constructor(password,params) {
    this.password=password;
    this.params=this.constructor.filterParams(params);
    this.memoizedCache={}
  }

  static filterParams(params) {
    return params
  }


}

export default PasswordDerivator