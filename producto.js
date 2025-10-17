const CATALOGO_URL = "https://script.google.com/macros/s/AKfycbxFF71yVoqvsW4LmhuYJ4aWh7Jtz5dyhVWwUPrsRvLtJz-oMN4ZyKTLKn9Aho34bjIgcg/exec";

let imagenes = [];
let indice = 0;
let imgEl;
let indicadores;

async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nombreEl = document.getElementById("nombre-producto");
  const precioEl = document.getElementById("precio-producto");
  const descEl   = document.getElementById("descripcion-producto");
  imgEl          = document.getElementById("imagen-principal");
  indicadores    = document.querySelector(".indicadores");

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
    imagenes = [producto.imagen];
    if (producto.imagenes) {
      imagenes = imagenes.concat(producto.imagenes.split(",").map(url => url.trim()));
    }

    indice = 0;
    imgEl.src = imagenes[indice];

    // Crear puntitos indicadores
    if (indicadores) {
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
    }

    // Flechas
    document.querySelector(".flecha.izquierda").addEventListener("click", () => {
      indice = (indice - 1 + imagenes.length) % imagenes.length;
      actualizarImagen();
    });

    document.querySelector(".flecha.derecha").addEventListener("click", () => {
      indice = (indice + 1) % imagenes.length;
      actualizarImagen();
    });

    // Swipe táctil
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

    // Botón copiar pedido
    const copiarBtn = document.getElementById("copiar-pedido");
    if (copiarBtn) {
      copiarBtn.addEventListener("click", async () => {
        const urlDetalle = window.location.href;
        const mensaje = buildMensajePedido(producto, urlDetalle, imgEl?.src || "");

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

  } catch (err) {
    console.error("Error al cargar detalle:", err);
    nombreEl.textContent = "Error al cargar producto";
  }
}

function actualizarImagen() {
  imgEl.src = imagenes[indice];
  if (indicadores) {
    document.querySelectorAll(".dot").forEach((dot, i) => {
      dot.classList.toggle("activo", i === indice);
    });
  }
}

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

document.addEventListener("DOMContentLoaded", cargarDetalle);





