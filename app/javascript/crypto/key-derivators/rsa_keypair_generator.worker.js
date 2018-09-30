import registerPromiseWorker from 'promise-worker/register';
import forge from 'node-forge'

registerPromiseWorker(({password, params}) => {
  let seed=buildHash(password,params);
  let buffer = forge.util.createBuffer(seed, 'raw');
  let prng = forge.random.createInstance();
  prng.seedFileSync = function (needed) {
    return buffer.getBytes(needed);
  };

  let {keySize, primeGeneratorAlgorithm} = params;
  let keypair = forge.pki.rsa.generateKeyPair({
    bits:      keySize,
    prng:      prng,
    algorithm: primeGeneratorAlgorithm
  });

  return  serializeRsaKeypair(keypair)
});

 function buildHash(password,params) {
  let {encodedSalt, iterations, messageDigestAlgorithm, hashSize} = params;
  let salt = forge.util.decode64(encodedSalt);
  return forge.pkcs5.pbkdf2(password, salt, iterations, hashSize, messageDigestAlgorithm);
}

function serializeRsaKeypair(keypair){
  return {
    publicKeyPem:forge.pki.publicKeyToPem(keypair.publicKey,10000),
    privateKeyPem:forge.pki.privateKeyToPem(keypair.privateKey,10000)
  }
}