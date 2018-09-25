import forge from 'node-forge'

class PasswordDerivator {

  constructor(params={}) {

    let options={};

    this.algorithm = params.algorithm || "pbkdf2";
    options.iterations = params.iterations || 1000;
    options.message_digest = params.iterations || "sha1";

    this.options=options
  }

  getKey(password,salt,size,callback){
    if(this.algorithm === "pbkdf2"){
      return forge.pkcs5.pbkdf2(password, salt, this.options.iterations, size, this.options.message_digest, callback)
    }else{
      throw new Error('Unknown key derivation algorithm: ' + this.algorithm);
    }
  }
}

export default PasswordDerivator;

