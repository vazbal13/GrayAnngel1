const CATALOGO_URL = "https://script.google.com/macros/s/AKfycbxFF71yVoqvsW4LmhuYJ4aWh7Jtz5dyhVWwUPrsRvLtJz-oMN4ZyKTLKn9Aho34bjIgcg/exec";

async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nombreEl = document.getElementById("nombre-producto");
  const precioEl = document.getElementById("precio-producto");
  const descEl   = document.getElementById("descripcion-producto");
  const imgEl    = document.getElementById("imagen-principal");

  // Loader y contenedor
  const loader = document.getElementById("loader");
  const detalle = document.getElementById("detalle-producto");

  loader.style.display = "block";   // mostrar loader
  detalle.style.display = "none";   // ocultar contenido

  try {
    const res = await fetch(CATALOGO_URL);
    const productos = await res.json();
    const producto = productos[id];

    if (!producto) {
      nombreEl.textContent = "Producto no encontrado";
      return;
    }

    // Datos básicos
    nombreEl.textContent = producto.nombre;
    precioEl.textContent = "Precio: " + producto.precio;
    descEl.textContent   = producto.descripcion || "Próximamente...";

    // Manejo de imágenes
    let imagenes = [producto.imagen];
    if (producto.imagenes) {
      imagenes = imagenes.concat(producto.imagenes.split(",").map(url => url.trim()));
    }

    let indice = 0;
    imgEl.src = imagenes[indice];

    // Flechas
    document.querySelector(".flecha.izquierda").addEventListener("click", () => {
      indice = (indice - 1 + imagenes.length) % imagenes.length;
      imgEl.src = imagenes[indice];
    });

    document.querySelector(".flecha.derecha").addEventListener("click", () => {
      indice = (indice + 1) % imagenes.length;
      imgEl.src = imagenes[indice];
    });

  } catch (err) {
    console.error("Error al cargar detalle:", err);
    nombreEl.textContent = "Error al cargar producto";
  } finally {
    loader.style.display = "none";   // ocultar loader
    detalle.style.display = "block"; // mostrar contenido
  }
}

document.addEventListener("DOMContentLoaded", cargarDetalle);
function buildMensajePedido(producto, urlDetalle, imagenActual) {
  const precio = producto.precio ? producto.precio : "Consultar";
  const descripcion = producto.descripcion ? producto.descripcion : "Sin descripción";
  return [
    "Hola 👋, quiero pedir este producto:",
    `• Nombre: ${producto.nombre}`,
    `• Precio: ${precio}`,
    `• Descripción: ${descripcion}`,
    imagenActual ? `• Imagen: ${imagenActual}` : "",
    `• Link: ${urlDetalle}`,
    "¿Me confirmas disponibilidad y tiempos de entrega?"
  ].filter(Boolean).join("\n");
}

function showToast(msg = "Pedido copiado ✅") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  const copiarBtn = document.getElementById("copiar-pedido");
  const imgEl = document.getElementById("imagen-principal");

  if (copiarBtn) {
    copiarBtn.addEventListener("click", async () => {
      const nombre = document.getElementById("nombre-producto").textContent;
      const precio = document.getElementById("precio-producto").textContent.replace("Precio: ", "");
      const descripcion = document.getElementById("descripcion-producto").textContent;
      const imagenActual = imgEl?.src || "";
      const urlDetalle = window.location.href;

      const producto = { nombre, precio, descripcion };
      const mensaje = buildMensajePedido(producto, urlDetalle, imagenActual);

      try {
        await navigator.clipboard.writeText(mensaje);
        showToast("Pedido copiado ✅");
      } catch {
        const area = document.createElement("textarea");
        area.value = mensaje;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        showToast("Pedido copiado ✅");
      }
    });
  }
});
let indice = 0;
let imagenes = [];
let imgPrincipal;
let indicadores;

async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  try {
    const res = await fetch(CATALOGO_URL);
    const productos = await res.json();
    const producto = productos[id];

    document.getElementById("nombre-producto").textContent = producto.nombre;
    document.getElementById("precio-producto").textContent = "Precio: " + producto.precio;
    document.getElementById("descripcion-producto").textContent = producto.descripcion;

    imagenes = [producto.imagen];
    if (producto.imagenes_extra) {
      imagenes = imagenes.concat(producto.imagenes_extra.split(","));
    }

    imgPrincipal = document.getElementById("imagen-principal");
    imgPrincipal.src = imagenes[indice];

    // indicadores
    indicadores = document.querySelector(".indicadores");
    indicadores.innerHTML = "";
    imagenes.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === indice ? " activo" : "");
      dot.addEventListener("click", () => {
        indice = i;
        actualizarImagen();
      });
      indicadores.appendChild(dot);
    });

    // flechas
    document.querySelector(".flecha.izquierda").addEventListener("click", () => {
      indice = (indice - 1 + imagenes.length) % imagenes.length;
      actualizarImagen();
    });
    document.querySelector(".flecha.derecha").addEventListener("click", () => {
      indice = (indice + 1) % imagenes.length;
      actualizarImagen();
    });

    // swipe táctil
    let startX = 0;
    let endX = 0;
    const carrusel = document.querySelector(".carrusel");
    carrusel.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });
    carrusel.addEventListener("touchend", e => {
      endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          indice = (indice - 1 + imagenes.length) % imagenes.length;
        } else {
          indice = (indice + 1) % imagenes.length;
        }
        actualizarImagen();
      }
    });

    // botón copiar pedido
    const copiarBtn = document.getElementById("copiar-pedido");
    copiarBtn.addEventListener("click", async () => {
      const urlDetalle = window.location.href;
      const mensaje = [
        "Hola 👋, quiero pedir este producto:",
        `• Nombre: ${producto.nombre}`,
        `• Precio: ${producto.precio || "Consultar"}`,
        producto.descripcion ? `• Descripción: ${producto.descripcion}` : "",
        imgPrincipal?.src ? `• Imagen: ${imgPrincipal.src}` : "",
        `• Link: ${urlDetalle}`,
        "¿Me confirmas disponibilidad y tiempos de entrega?"
      ].filter(Boolean).join("\n");

      try {
        await navigator.clipboard.writeText(mensaje);
        showToast("Pedido copiado ✅");
      } catch {
        const area = document.createElement("textarea");
        area.value = mensaje;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        showToast("Pedido copiado ✅");
      }
    });

  } catch (err) {
    console.error("Error al cargar detalle:", err);
  }
}

function actualizarImagen() {
  imgPrincipal.src = imagenes[indice];
  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("activo", i === indice);
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2000);
}

document.addEventListener("DOMContentLoaded", cargarDetalle);




