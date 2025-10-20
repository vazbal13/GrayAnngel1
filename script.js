const CATALOGO_URL = "https://script.google.com/macros/s/AKfycbxFF71yVoqvsW4LmhuYJ4aWh7Jtz5dyhVWwUPrsRvLtJz-oMN4ZyKTLKn9Aho34bjIgcg/exec";
const VENDEDORES_URL  = "https://script.google.com/macros/s/AKfycbyWyu-BFWQP5dxHfDhl1qmWBM3s6cQt_p4BUnLoCEnd2LuLrfT71xwyaRK9stEgSAtfHg/exec";
const UBICACIONES_URL = "https://script.google.com/macros/s/AKfycbxMXTOnQDKQlVHVMNo05iW3Sqgq2zH1dXL-1quqSkvM4yqo3BoN9786epgAUWHyPPj1/exec";

async function cargarCatalogo() {
  const gal = document.getElementById("galeria-productos");

  try {
    const res = await fetch(CATALOGO_URL);
    const productos = await res.json();

    gal.innerHTML = "";

    productos.forEach((p, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.tags = p.tags ? p.tags.toLowerCase() : "";

      card.innerHTML = `
        <a href="producto.html?id=${index}">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
          <h3>${p.nombre}</h3>
          <p>${p.precio}</p>
        </a>
        <div class="card-actions">
          <button class="btn-mini copiar-ref" data-id="${index}">📋 Copiar </button>
        </div>
      `;
      gal.appendChild(card);
    });
    inicializarBuscadorConLista(productos);
    inicializarFiltros();

    function inicializarBuscadorConLista(productos) {
  const input = document.getElementById("busqueda-modelo");
  const lista = document.getElementById("sugerencias");
  const cards = document.querySelectorAll(".card");
  if (!input || !lista) return;

  // 👉 Evento al escribir (muestra sugerencias)
  input.addEventListener("input", () => {
    const texto = input.value.toLowerCase().trim();
    lista.innerHTML = "";

    if (!texto) {
      lista.style.display = "none";
      // Mostrar todos los productos si no hay texto
      cards.forEach(card => card.style.display = "block");
      return;
    }

    const palabras = texto.split(/\s+/);

    const coincidencias = productos.filter(p => {
      const nombre = (p.nombre || "").toLowerCase();
      const tags   = (p.tags || "").toLowerCase();
      return palabras.every(palabra =>
        nombre.includes(palabra) || tags.includes(palabra)
      );
    });

    if (coincidencias.length === 0) {
      lista.style.display = "none";
      return;
    }

    coincidencias.slice(0, 5).forEach((p) => {
      const li = document.createElement("li");

      // Resaltar coincidencias
      let nombreResaltado = p.nombre;
      palabras.forEach(palabra => {
        const regex = new RegExp(`(${palabra})`, "gi");
        nombreResaltado = nombreResaltado.replace(regex, "<strong>$1</strong>");
      });

      li.innerHTML = nombreResaltado;
      li.addEventListener("click", () => {
        // 👉 Filtrar galería al hacer clic en sugerencia
        cards.forEach((card, i) => {
          const nombre = (productos[i].nombre || "").toLowerCase();
          const tags   = (productos[i].tags || "").toLowerCase();
          const match = palabras.every(palabra =>
            nombre.includes(palabra) || tags.includes(palabra)
          );
          card.style.display = match ? "block" : "none";
        });
        lista.style.display = "none";
      });
      lista.appendChild(li);
    });

    lista.style.display = "block";
  });

  // 👉 Evento al presionar Enter (filtra galería)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const texto = input.value.toLowerCase().trim();
      if (!texto) {
        cards.forEach(card => card.style.display = "block");
        return;
      }

      const palabras = texto.split(/\s+/);

      cards.forEach((card, i) => {
        const nombre = (productos[i].nombre || "").toLowerCase();
        const tags   = (productos[i].tags || "").toLowerCase();
        const match = palabras.every(palabra =>
          nombre.includes(palabra) || tags.includes(palabra)
        );
        card.style.display = match ? "block" : "none";
      });

      lista.style.display = "none";
    }
  });

  // 👉 Ocultar lista al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".buscador")) {
      lista.style.display = "none";
    }
  });
}


    
    inicializarCopiarDesdeGaleria(productos);

  } catch (err) {
    console.error("Error al cargar catálogo:", err);
    gal.innerHTML = "<p>No se pudo cargar la galería.</p>";
  }
}

function inicializarCopiarDesdeGaleria(productos) {
  document.querySelectorAll(".copiar-ref").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id, 10);
      const p = productos[id];
      const urlDetalle = `${location.origin}${location.pathname.replace("index.html","")}producto.html?id=${id}`;

      const mensaje = [
        "Hola 👋, quiero pedir este producto:",
        `• Nombre: ${p.nombre}`,
        `• Precio: ${p.precio || "Consultar"}`,
        p.descripcion ? `• Descripción: ${p.descripcion}` : "",
        p.imagen ? `• Imagen: ${p.imagen}` : "",
        `• Link: ${urlDetalle}`,
        "¿Me confirmas disponibilidad y tiempos de entrega?"
      ].filter(Boolean).join("\n");

      try {
        await navigator.clipboard.writeText(mensaje);
        alert("Pedido copiado ✅ Ahora pégalo en WhatsApp");
      } catch {
        const area = document.createElement("textarea");
        area.value = mensaje;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        alert("Pedido copiado ✅ Ahora pégalo en WhatsApp");
      }
    });
  });
}

function inicializarFiltros() {
  const botones = document.querySelectorAll(".filtros button");
  const cards = document.querySelectorAll(".card");

  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      // Quitar clase activo de todos
      botones.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");

      const tag = btn.dataset.tag;

      cards.forEach(card => {
        if (tag === "todos" || card.dataset.tags.includes(tag)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}
async function cargarVendedores() {
  const contenedor = document.querySelector(".vendedores");
  try {
    const res = await fetch(VENDEDORES_URL);
    const vendedores = await res.json();
    vendedores.forEach(v => {
      const div = document.createElement("div");
      div.className = "vendedor";
      div.innerHTML = `
        <h3>${v.nombre}</h3>
        <p>📞 Tel: ${v.telefono}</p>
        <p>📧 Email: ${v.email}</p>
        <p><a href="${v.whatsapp}" target="_blank">💬 WhatsApp</a></p>
      `;
      contenedor.appendChild(div);
    });
  } catch (err) {
    console.error("Error al cargar vendedores:", err);
    contenedor.innerHTML = "<p>No se pudo cargar la información de contacto.</p>";
  }
}

async function cargarUbicaciones() {
  const lista = document.querySelector(".ubicacion ul");
  try {
    const res = await fetch(UBICACIONES_URL);
    const ubicaciones = await res.json();
    ubicaciones.forEach(u => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${u.tienda}</strong><br>
        📍 ${u.direccion}<br>
        <a href="${u.maps_url}" target="_blank">🗺️ Google Maps</a> | 
        <a href="${u.waze_url}" target="_blank">🚗 Waze</a>
      `;
      lista.appendChild(item);
    });
  } catch (err) {
    console.error("Error al cargar ubicaciones:", err);
    lista.innerHTML = "<p>No se pudo cargar la ubicación.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCatalogo();
  cargarVendedores();
  cargarUbicaciones();

});
// Sidebar toggle
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.querySelector(".menu-toggle");
  const closeBtn = document.querySelector(".close-btn");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });

  // Cerrar al hacer clic en un enlace
  document.querySelectorAll(".sidebar-nav a").forEach(link => {
    link.addEventListener("click", () => sidebar.classList.remove("active"));
  });
});





