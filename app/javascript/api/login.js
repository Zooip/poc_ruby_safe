import forge from "node-forge"

export const retrieveAuthOptionsFor = function(identifier){
  console.log("API call with id : ", identifier);

  return new Promise(function (resolve, reject) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body="{\"identifier\": \""+identifier+"\"}";
    console.log(body);

    const request = new Request('/login/identify', {
      method:  'POST',
      body: body,
      headers: headers,

    });

    console.log(request);

    fetch(request).then(response => {
      console.log("response : ",response);
      if (response.status === 200) {
        return resolve(response.json());
      } else if (response.status === 404) {
        return reject("User not found")
      }
      return reject("Unknown Code : "+response.status)
    },(obj)=>{
      console.log(obj);
      return reject("Unknown Error")
    }).catch(error => {
      console.error(error);
      return reject("Catched Error")
    })
  });
};