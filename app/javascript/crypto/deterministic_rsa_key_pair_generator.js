import forge from 'node-forge'

class DeterministicRsaKeyPairGenerator {

  constructor(params={}){
    this.keySize=params.keySize||2048;
    this.algorithm=params.algorithm||'PRIMEINC';
  }

  generateKeyPair(prngSeed,callback) {
    let buffer=forge.util.createBuffer(this.hash, 'raw');
    let prng = forge.random.createInstance();
    prng.seedFileSync = function(needed) {
      // get 'needed' number of random bytes from somewhere
      return buffer.getBytes(needed);
    };

    return forge.pki.rsa.generateKeyPair({bits: this.keySize, prng: prng, algorithm: this.algorithm, workers: -1}, function(_err,keypair){callback(keypair)})
  }

}

export default  DeterministicRsaKeyPairGenerator