document.addEventListener('DOMContentLoaded', function() {
    let eventos = [];
    let editando = null;
    let pagina = 1;
    const porPagina = 3;

    const $ = (id) => document.getElementById(id);
    const tabla = $('tablaEventos');
    const cards = $('contenedorCards');
    const buscar = $('buscar');
    const btnOrdenar = $('ordenar');
    const btnGuardar = $('btnGuardar');

    const f = {
        codigo: $('codigo'),
        nombre: $('nombre'),
        lugar: $('lugar'),
        fecha: $('fecha'),
        hora: $('hora'),
        categoria: $('categoria'),
        cupos: $('cupos'),
        descripcion: $('descripcion')
    };

    function iniciar() {
        cargarEventos();
        actualizarTodo();
    }

    function cargarEventos() {
        const datos = localStorage.getItem('eventos');
        if (datos) {
            eventos = JSON.parse(datos);
        } else {
            eventos = [];
            guardarEventos();
        }
    }

    function guardarEventos() {
        localStorage.setItem('eventos', JSON.stringify(eventos));
    }

    function actualizarTodo() {
        renderizarTabla();
        renderizarCards();
        actualizarEstadisticas();
        actualizarPaginacion();
    }

    function renderizarTabla() {
        if (eventos.length === 0) {
            tabla.innerHTML = `<tr><td colspan="8" class="text-center py-4">No hay eventos registrados. ¡Crea el primero!</td></tr>`;
            return;
        }

        const inicio = (pagina - 1) * porPagina;
        const fin = inicio + porPagina;
        const paginados = eventos.slice(inicio, fin);
        tabla.innerHTML = paginados.map(e => `
            <tr>
                <td><span class="badge bg-secondary">${e.codigo}</span></td>
                <td><strong>${e.nombre}</strong></td>
                <td>${e.lugar}</td>
                <td>${formatearFecha(e.fecha)}</td>
                <td>${e.hora}</td>
                <td><span class="badge bg-info">${e.categoria}</span></td>
                <td><span class="badge ${e.cupos > 50 ? 'bg-success' : 'bg-warning'}">${e.cupos}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editar('${e.codigo}')">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminar('${e.codigo}')">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    function renderizarCards() {
        if (eventos.length === 0) {
            cards.innerHTML = `
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body text-center py-5">
                            <p class="text-muted mb-0">No hay eventos destacados para mostrar</p>
                            <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#eventoModal">
                                Crear primer evento
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const mostrar = eventos.slice(0, 3);
        cards.innerHTML = mostrar.map(e => `
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title">${e.nombre}</h5>
                            <span class="badge bg-primary">${e.categoria}</span>
                        </div>
                        <p class="card-text text-muted small">${e.descripcion.substring(0, 50)}${e.descripcion.length > 50 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between">
                            <span class="badge bg-secondary">${e.lugar}</span>
                            <span class="badge bg-success">${e.cupos} cupos</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100 mt-2" data-bs-toggle="collapse" data-bs-target="#c${e.codigo}">
                            Ver más
                        </button>
                        <div class="collapse mt-2" id="c${e.codigo}">
                            <div class="card card-body bg-light">
                                <p><strong>Fecha:</strong> ${formatearFecha(e.fecha)} ${e.hora}</p>
                                <p class="mb-0">${e.descripcion}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function actualizarEstadisticas() {
        const total = eventos.length;
        const categorias = new Set(eventos.map(e => e.categoria)).size;
        const cupos = eventos.reduce((sum, e) => sum + e.cupos, 0);
        const futuros = eventos.filter(e => new Date(e.fecha) >= new Date()).length;
        const conCupos = eventos.filter(e => e.cupos > 0).length;

        const heroBadges = document.querySelectorAll('#hero .badge');
        if (heroBadges.length >= 3) {
            heroBadges[0].textContent = total;
            heroBadges[1].textContent = categorias;
            heroBadges[2].textContent = cupos;
        }

        const estadisticas = document.querySelectorAll('#estadisticas .display-6');
        if (estadisticas.length >= 3) {
            estadisticas[0].textContent = futuros;
            estadisticas[1].textContent = conCupos;
            estadisticas[2].textContent = categorias;
        }

        const items = document.querySelectorAll('#hero .list-group-item');
        if (items.length >= 3) {
            items[0].innerHTML = `Eventos activos <span class="badge bg-success">${total}</span>`;
            items[1].innerHTML = `Categorías disponibles <span class="badge bg-info">${categorias}</span>`;
            items[2].innerHTML = `Cupos totales <span class="badge bg-warning text-dark">${cupos}</span>`;
        }
    }

    function actualizarPaginacion() {
        const total = Math.ceil(eventos.length / porPagina);
        const pag = document.querySelector('.pagination');
        
        if (total <= 1) {
            pag.innerHTML = `
                <li class="page-item disabled"><a class="page-link">Anterior</a></li>
                <li class="page-item active"><a class="page-link">1</a></li>
                <li class="page-item disabled"><a class="page-link">Siguiente</a></li>
            `;
            return;
        }

        let html = `<li class="page-item ${pagina === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${pagina-1}">Anterior</a></li>`;
        
        for (let i = 1; i <= total; i++) {
            html += `<li class="page-item ${i === pagina ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        
        html += `<li class="page-item ${pagina === total ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${pagina+1}">Siguiente</a></li>`;
        
        pag.innerHTML = html;

        document.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.onclick = function(e) {
                e.preventDefault();
                const p = parseInt(this.dataset.page);
                if (p >= 1 && p <= total) {
                    pagina = p;
                    renderizarTabla();
                    actualizarPaginacion();
                }
            };
        });
    }

    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function toast(mensaje, tipo = 'success') {
        const contenedor = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${tipo} border-0`;
        toast.role = 'alert';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${mensaje}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        contenedor.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    function validar() {
        const { codigo, nombre, lugar, fecha, hora, categoria, cupos, descripcion } = f;
        
        if (!codigo.value.trim() || !nombre.value.trim() || !lugar.value.trim() || 
            !fecha.value || !hora.value || !cupos.value || !descripcion.value.trim()) {
            toast('Todos los campos son obligatorios', 'danger');
            return false;
        }

        const existe = eventos.find(e => e.codigo === codigo.value.trim() && (!editando || e.codigo !== editando.codigo));
        if (existe) {
            toast('Código ya registrado', 'danger');
            return false;
        }

        if (new Date(fecha.value) < new Date().setHours(0,0,0,0)) {
            toast('No se permiten fechas pasadas', 'danger');
            return false;
        }

        if (parseInt(cupos.value) <= 0) {
            toast('Los cupos deben ser mayor a 0', 'danger');
            return false;
        }

        return true;
    }

    function guardarEvento() {
        if (!validar()) return;

        const datos = {
            codigo: f.codigo.value.trim(),
            nombre: f.nombre.value.trim(),
            lugar: f.lugar.value.trim(),
            fecha: f.fecha.value,
            hora: f.hora.value,
            categoria: f.categoria.value,
            cupos: parseInt(f.cupos.value),
            descripcion: f.descripcion.value.trim()
        };

        if (editando) {
            const index = eventos.findIndex(e => e.codigo === editando.codigo);
            eventos[index] = datos;
            toast('Evento actualizado correctamente');
            editando = null;
        } else {
            eventos.push(datos);
            toast('Evento registrado correctamente');
        }

        guardarEventos();
        actualizarTodo();
        limpiar();
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventoModal'));
        if (modal) modal.hide();
    }

    function editarEvento(codigo) {
        const e = eventos.find(ev => ev.codigo === codigo);
        if (!e) return;

        editando = e;
        f.codigo.value = e.codigo;
        f.nombre.value = e.nombre;
        f.lugar.value = e.lugar;
        f.fecha.value = e.fecha;
        f.hora.value = e.hora;
        f.categoria.value = e.categoria;
        f.cupos.value = e.cupos;
        f.descripcion.value = e.descripcion;
        f.codigo.disabled = true;

        new bootstrap.Modal(document.getElementById('eventoModal')).show();
    }

    function eliminarEvento(codigo) {
        if (!confirm('¿Está seguro de eliminar este evento?')) return;
        eventos = eventos.filter(e => e.codigo !== codigo);
        guardarEventos();
        actualizarTodo();
        toast('Evento eliminado correctamente', 'warning');
    }

    function limpiar() {
        Object.values(f).forEach(input => input.value = '');
        f.categoria.value = 'IoT';
        f.codigo.disabled = false;
        editando = null;
    }

    function buscarEventos() {
        const termino = buscar.value.toLowerCase();
        if (!termino) {
            cargarEventos();
            actualizarTodo();
            return;
        }

        const filtrados = eventos.filter(e => 
            e.nombre.toLowerCase().includes(termino) ||
            e.codigo.toLowerCase().includes(termino) ||
            e.categoria.toLowerCase().includes(termino) ||
            e.lugar.toLowerCase().includes(termino)
        );
        
        const originales = eventos;
        eventos = filtrados;
        renderizarTabla();
        renderizarCards();
        actualizarPaginacion();
        eventos = originales;
    }

    let ascendente = true;
    function ordenarEventos() {
        if (eventos.length === 0) {
            toast('No hay eventos para ordenar', 'warning');
            return;
        }

        ascendente = !ascendente;
        eventos.sort((a, b) => {
            const fa = new Date(a.fecha + ' ' + a.hora);
            const fb = new Date(b.fecha + ' ' + b.hora);
            return ascendente ? fa - fb : fb - fa;
        });
        guardarEventos();
        actualizarTodo();
        toast(`Ordenado ${ascendente ? 'ascendente' : 'descendente'}`);
    }

    function aplicarFiltros() {
        const termino = document.querySelector('#offcanvasFiltros input[type="text"]').value.toLowerCase();
        const categoria = document.querySelector('#offcanvasFiltros select').value;
        const desde = document.querySelector('#offcanvasFiltros input[type="date"]').value;
        const hasta = document.querySelector('#offcanvasFiltros input[type="date"]:nth-child(2)').value;

        let filtrados = eventos;

        if (termino) filtrados = filtrados.filter(e => e.nombre.toLowerCase().includes(termino));
        if (categoria !== 'Todos') filtrados = filtrados.filter(e => e.categoria === categoria);
        if (desde) filtrados = filtrados.filter(e => e.fecha >= desde);
        if (hasta) filtrados = filtrados.filter(e => e.fecha <= hasta);

        const originales = eventos;
        eventos = filtrados;
        renderizarTabla();
        renderizarCards();
        actualizarPaginacion();
        eventos = originales;

        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasFiltros'));
        if (offcanvas) offcanvas.hide();
        
        toast(`Mostrando ${filtrados.length} eventos filtrados`);
    }

    btnGuardar.onclick = guardarEvento;
    buscar.oninput = buscarEventos;
    btnOrdenar.onclick = ordenarEventos;
    
    const btnFiltros = document.querySelector('#offcanvasFiltros .btn-primary');
    if (btnFiltros) btnFiltros.onclick = aplicarFiltros;
    
    document.getElementById('eventoModal').addEventListener('hidden.bs.modal', limpiar);

    window.editar = editarEvento;
    window.eliminar = eliminarEvento;

    iniciar();
});