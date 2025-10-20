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
  const loader   = document.getElementById("loader");
  const contenedor = document.getElementById("detalle-producto");

  contenedor.classList.add("loading");
  loader.classList.add("visible");

  try {
    const res = await fetch(CATALOGO_URL);
    const productos = await res.json();
    const producto = productos[id];

    if (!producto) {
      nombreEl.textContent = "Producto no encontrado";
      return;
    }

    nombreEl.textContent = producto.nombre;
    precioEl.textContent = "Precio: " + (producto.precio || "Consultar");
    descEl.textContent   = producto.descripcion || "Próximamente...";

    imagenes = [producto.imagen].filter(Boolean);
    if (producto.imagenes) {
      imagenes = imagenes.concat(producto.imagenes.split(",").map(u => u.trim()).filter(Boolean));
    }
    indice = 0;

    await new Promise((resolve) => {
      imgEl.onload = resolve;
      imgEl.onerror = resolve;
      imgEl.src = imagenes[indice] || "";
    });

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

    document.querySelector(".flecha.izquierda").addEventListener("click", () => {
      indice = (indice - 1 + imagenes.length) % imagenes.length;
      actualizarImagen();
    });
    document.querySelector(".flecha.derecha").addEventListener("click", () => {
      indice = (indice + 1) % imagenes.length;
      actualizarImagen();
    });

    // Swipe táctil optimizado
    let startX = 0;
    let startY = 0;
    const carrusel = document.querySelector(".carrusel");

    carrusel.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    carrusel.addEventListener("touchmove", e => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      const angulo = Math.abs(Math.atan2(diffY, diffX) * (180 / Math.PI));
      if (angulo < 30) {
        e.preventDefault(); // Solo si el gesto es claramente horizontal
      }
    }, { passive: false });

    carrusel.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;

      if (Math.abs(diffX) > 50) {
        indice = diffX > 0
          ? (indice - 1 + imagenes.length) % imagenes.length
          : (indice + 1) % imagenes.length;
        actualizarImagen();
      }
    });

  } catch (err) {
    console.error("Error al cargar detalle:", err);
    nombreEl.textContent = "Error al cargar producto";
  } finally {
    loader.classList.remove("visible");
    contenedor.classList.remove("loading");
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

function inicializarCopiarPedido() {
  const btn = document.getElementById("copiar-pedido");
  const toast = document.getElementById("toast");

  if (!btn) return;

  btn.addEventListener("click", () => {
    const nombre = document.getElementById("nombre-producto").textContent;
    const precio = document.getElementById("precio-producto").textContent;
    const url    = window.location.href;

    const texto = `Hola, me interesa el modelo:\n${nombre}\n${precio}\n${url}`;
    navigator.clipboard.writeText(texto).then(() => {
      toast.classList.add("visible");
      setTimeout(() => toast.classList.remove("visible"), 2000);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarDetalle();
  inicializarCopiarPedido();
});



