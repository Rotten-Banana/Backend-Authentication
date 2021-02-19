var token='';

async function loading(){
    const key = sessionStorage.getItem('token')
    if(key!==null){
        const data = await getRoot(key);
        showPost(data)
    }
}

async function postLogin(){
    const username = document.querySelector('#username_login').value;
    const password = document.querySelector('#password_login').value;
    const user = {username: username, password: password};
    
    const response = await postData('http://localhost:5000/login',user);
    token = await response.text()
    const data2 = await getRoot(token);
    sessionStorage.setItem('token',token);
    showPost(data2)
}

async function getRoot(token = ''){
    if(token === 'not found' || token === 'username already exist try another one' || token === 'no such user exist'){
        return [{message: token}];
    }else{
        const res = await fetch('http://localhost:5000',{
            method: 'GET',
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();
        return data;
    }
}

function showPost(data){
    const forms = document.querySelectorAll('.form')
    const post_field = document.querySelector('#post')
    const content = document.querySelector('#content')
    forms.forEach(index=>{
        index.style.display = 'none'
    })
    if(data[0].message==='no post found'){
        post_field.style.display = 'block'
        content.innerHTML = `<p>${data[0].message}</p>`
    }else if(data[0].message!==undefined){
        content.innerHTML = `<p>${data[0].message}</p>`
    }else{
        post_field.style.display = 'block'
        data.forEach(index=>{
            content.innerHTML += `<p>${index.title}: ${index.body}</p>`
        })
    }
}

async function addPost(){
    var title = document.querySelector('#title_field')
    var body = document.querySelector('#body_field')
    const post = {title: title.value, body: body.value};
    const key = sessionStorage.getItem('token')
    fetch('http://localhost:5000/post',{
        method: 'POST',
        headers:{
           'Authorization':`Bearer ${key}`,
           'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    })
    const content = document.querySelector('#content');
    content.innerHTML = '';
    loading();
    title.value = ''
    body.value = ''
}

async function postSignup(){
    const username = document.querySelector('#username_signup').value;
    const password = document.querySelector('#password_signup').value;
    const user = {username: username, password: password};
    
    const response = await postData('http://localhost:5000/signup',user);
    token = await response.text()
    const data2 =await getRoot(token);
    sessionStorage.setItem('token',token);
    showPost(data2)
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
return response;
}