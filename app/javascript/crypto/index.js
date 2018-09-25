import PasswordDerivator from './password_derivator'
import DeterministicRsaKeyPairGenerator from './deterministic_rsa_key_pair_generator'


export const passwordToRsaKeyPairPromise = function(password, salt, passwordDerivationParams={}, rsaKeyPairGeneratorParams={}){
  return new Promise(function(resolve, _reject) {
    console.time("generateKeyPair");
    let kd = new PasswordDerivator(passwordDerivationParams);
    let rsaGen = new DeterministicRsaKeyPairGenerator(rsaKeyPairGeneratorParams);

    console.log("Set Promise")

    kd.getKey(password,salt,512,function(seed){
      rsaGen.generateKeyPair(seed,function(keypair){
        console.log("resolve Promise with :", keypair);
        console.timeEnd("generateKeyPair");
        resolve(keypair);
      })
    });

  });
};