document.addEventListener("DOMContentLoaded", function () {

    let boton = document.getElementById("cambiartema");

    if (boton) {

        let tema = localStorage.getItem("tema-bootstrap") || "light";

        document.documentElement.setAttribute("data-bs-theme", tema);

        if (tema == "light") {
            boton.textContent = "Modo oscuro";
        } else {
            boton.textContent = "Modo claro";
        }

        boton.onclick = function () {

            if (document.documentElement.getAttribute("data-bs-theme") == "light") {

                document.documentElement.setAttribute("data-bs-theme", "dark");
                localStorage.setItem("tema-bootstrap", "dark");
                boton.textContent = "Modo claro";

            } else {

                document.documentElement.setAttribute("data-bs-theme", "light");
                localStorage.setItem("tema-bootstrap", "light");
                boton.textContent = "Modo oscuro";

            }

        };

    }

    let formulario = document.getElementById("formProducto");

    if (formulario) {

        formulario.onsubmit = function (e) {

            e.preventDefault();

            let nombre = document.getElementById("nombre");
            let email = document.getElementById("email");
            let descripcion = document.getElementById("descripcion");
            let alerta = document.getElementById("formAlert");

            let valido = true;

            nombre.className = "form-control";
            email.className = "form-control";
            descripcion.className = "form-control";

            if (nombre.value.trim() == "") {
                nombre.classList.add("is-invalid");
                valido = false;
            } else {
                nombre.classList.add("is-valid");
            }

            if (email.value.trim() == "" || !email.value.includes("@")) {
                email.classList.add("is-invalid");
                valido = false;
            } else {
                email.classList.add("is-valid");
            }

            if (descripcion.value.trim() == "") {
                descripcion.classList.add("is-invalid");
                valido = false;
            } else {
                descripcion.classList.add("is-valid");
            }

            if (valido) {

                alerta.innerHTML = `
                <div class="alert alert-success">
                    ¡Mensaje enviado correctamente!
                </div>`;

                formulario.reset();

                nombre.className = "form-control";
                email.className = "form-control";
                descripcion.className = "form-control";

            } else {

                alerta.innerHTML = `
                <div class="alert alert-danger">
                    Complete correctamente todos los campos.
                </div>`;

            }

        };

    }

    let subir = document.getElementById("backToTop");

    if (subir) {

        window.onscroll = function () {

            if (window.scrollY > 300) {
                subir.style.display = "flex";
            } else {
                subir.style.display = "none";
            }

        };

        subir.onclick = function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };

    }

});

window.addEventListener("load", function () {

    let spinner = document.getElementById("pageSpinner");

    if (spinner) {
        spinner.remove();
    }

});