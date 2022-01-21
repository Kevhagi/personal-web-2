function validasiRegistrasi(){

    let name = document.getElementById("input-name").value
    let email = document.getElementById("input-email").value
    let password = document.getElementById("input-password").value

    if(name == ''){
        alert("Nama harus diisi!")
    }
    else if(email == ''){
        alert("Email harus diisi!")
    }
    else if(password == ''){
        alert("Password harus diisi!")
    }
}

function validasiLogin(){

    let email = document.getElementById("input-email").value
    let password = document.getElementById("input-password").value

    if(email == ''){
        alert("Email harus diisi!")
    }
    else if(password == ''){
        alert("Password harus diisi!")
    }
}