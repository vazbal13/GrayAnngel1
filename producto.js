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
        indice = diff > 0
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

document.addEventListener("DOMContentLoaded", cargarDetalle);
