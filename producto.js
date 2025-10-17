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

  try {
    // Mostrar loader
    if (loader) loader.style.display = "block";

    const res = await fetch(CATALOGO_URL);
    const productos = await res.json();
    const producto = productos[id];

    if (!producto) {
      nombreEl.textContent = "Producto no encontrado";
      return;
    }

    // Datos básicos
    nombreEl.textContent = producto.nombre;
    precioEl.textContent = "Precio: " + (producto.precio || "Consultar");
    descEl.textContent   = producto.descripcion || "Próximamente...";

    // Imágenes
    imagenes = [producto.imagen].filter(Boolean);
    if (producto.imagenes) {
      imagenes = imagenes.concat(producto.imagenes.split(",").map(u => u.trim()).filter(Boolean));
    }
    indice = 0;

    // Precarga primera imagen antes de ocultar loader
    await new Promise((resolve, reject) => {
      imgEl.onload = resolve;
      imgEl.onerror = resolve; // no bloquea si falla
      imgEl.src = imagenes[indice] || "";
    });

    // Crear puntitos
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
        indice = diff > 0
          ? (indice - 1 + imagenes.length) % imagenes.length
          : (indice + 1) % imagenes.length;
        actualizarImagen();
      }
    });

    // Botón copiar pedido
    const copiarBtn = document.getElementById("copiar-pedido");
    if (copiarBtn) {
      copiarBtn.addEventListener("click", async () => {
        const mensaje = buildMensajePedido(
          { nombre: producto.nombre, precio: producto.precio, descripcion: producto.descripcion },
          window.location.href,
          imgEl?.src || ""
        );
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
  } finally {
    // Ocultar loader
    if (loader) loader.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", cargarDetalle);

