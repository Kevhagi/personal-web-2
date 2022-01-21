function submitData(){
    
    let name = document.getElementById("input-name").value
    let email = document.getElementById("input-email").value
    let phone = document.getElementById("input-phone").value
    let subject = document.getElementById("input-subject").value
    let msg = document.getElementById("input-msg").value
    let lang = ""

    if(document.getElementById('javascript').checked & document.getElementById('php').checked){
        lang = document.getElementById('javascript').value + " and " + document.getElementById('php').value
    }
    else if(document.getElementById('javascript').checked){
        lang = document.getElementById('javascript').value
    }
    else if(document.getElementById('php').checked){
        lang = document.getElementById('php').value
    }

    let hiring = document.createElement('a')
    let collabProblem = document.createElement('a')

    let hiringBody = "Hello, my name is " + name + ". " + msg + ". I'd like to use " + lang + " as the programming language. Here is my phone number to help you easier to contact me : " + phone +". Greetings, " + name;
    let collabProblemBody = "Hello, my name is " + name + ". " + msg + ". Here is my phone number to help you easier to contact me : " + phone + ". Greetings, " + name;
    
    hiring.href = `mailto: ${email}?subject= ${subject} &body=${hiringBody}`
    collabProblem.href = `mailto: ${email}?subject= ${subject} &body=${collabProblemBody}`

    if(name == ''){
        alert("Nama harus diisi!");
    }
    else if(email == ''){
        alert("Email harus diisi!");
    }
    else if(phone == ''){
        alert("No. telp harus diisi!");
    }
    else if(subject == ''){
        alert("Subject harus diisi!");
    }
    else if(msg == ''){
        alert("Pesan harus diisi!");
    }
    else if(subject == "I'm Hiring"){
        hiring.click();
        document.location.reload(true);
    }
    else if(subject == "Collaboration" || subject == "Problem with the site"){
        collabProblem.click();
        document.location.reload(true);
    }

    let dataObject = {
        nama : name,
        email : email,
        phoneNumber : phone,
        subject : subject,
        programmingLanguage : lang,
        message : msg
    }

    console.log(dataObject);

}

