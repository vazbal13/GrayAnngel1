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
  }
}

document.addEventListener("DOMContentLoaded", cargarDetalle);

