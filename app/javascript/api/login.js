import forge from "node-forge"

export const retrieveAuthOptionsFor = function (_id) {
  console.log("Simulating API response for login challenge options ...");
  return new Promise(function (resolve) {
    setTimeout(() => {resolve({
      challenge: {
        encoded64: forge.util.encode64(forge.random.getBytesSync(48)),
        expires_at: new Date((new Date()).getTime() + 5*60000).toISOString()// in 5 mionutes
      },
      keyDerivationOption: {
        encodedSalt:           forge.util.encode64(forge.random.getBytesSync(48)),
        algorithm:      "pbkdf2",
        iterations:     1000,
        message_digest: "sha1"
      }
    })},2000);
  });
};