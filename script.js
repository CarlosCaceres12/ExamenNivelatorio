const container = document.getElementById("departmentsContainer");
const detail = document.getElementById("detailContainer");
const searchInput = document.getElementById("searchInput");

let departments = [];

// Carga inicial de departamentos
async function loadDepartments() {
  try {
    const res = await fetch("https://api-colombia.com/api/v1/Department");
    departments = await res.json();
    renderCards(departments);
  } catch {
    container.innerHTML = "<p>Error al cargar datos.</p>";
  }
}

// Renderiza las tarjetas en la columna izquierda
function renderCards(data) {
  container.innerHTML = "";

  data.forEach(dep => {
    const card = document.createElement("div");
    card.className = "card";

    const imagePath = `images/departments/${dep.id}.jpg`;

    card.innerHTML = `
      <img
        src="${imagePath}"
        class="card-img"
        alt="${dep.name}"
        onerror="this.src='images/departments/default.jpg'"
      >
      <div class="card-content">
        <h3>${dep.name}</h3>
        <p><strong>Capital:</strong> ${dep.cityCapital?.name || "N/A"}</p>
      </div>
    `;

    card.addEventListener("click", () => showDetail(dep.id));
    container.appendChild(card);
  });
}

// Muestra el detalle del departamento y prepara la lista de municipios
async function showDetail(id) {
  try {
    const res = await fetch(`https://api-colombia.com/api/v1/Department/${id}`);
    const dep = await res.json();

    const citiesres = await fetch(`https://api-colombia.com/api/v1/Department/${id}/cities`);
    const cities = await citiesres.json();

    const imagePath = `images/departments/${id}.jpg`;

    detail.innerHTML = `
      <div class="detail-card">
        <img
          src="${imagePath}"
          class="detail-img"
          alt="${dep.name}"
          onerror="this.src='images/departments/default.jpg'"
        >
        <h2>${dep.name}</h2>
        <div class="stats-grid">
          <p><strong>Capital:</strong> ${dep.cityCapital?.name || "No disponible"}</p>
          <p><strong>Población:</strong> ${dep.population ? dep.population.toLocaleString() : "No disponible"}</p>
          <p><strong>Superficie:</strong> ${dep.surface ? dep.surface.toLocaleString() + " km²" : "No disponible"}</p>
        </div>
        <p class="description">${dep.description || ""}</p>
        
        <hr>

        <div class="municipios-section">
          <h3>Municipios (${cities.length})</h3>
          <input type="text" id="municipioSearch" placeholder="🔍 Filtrar municipios..." class="mun-search-input">
          
          <div id="municipiosList" class="municipios-list">
            ${cities.map(city => `
              <div class="municipio-item" data-id="${city.id}">
                <div class="municipio-header">
                  ${city.name}
                  <span class="icon">▼</span>
                </div>
                <div id="municipio-${city.id}" class="municipio-body"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Activar funciones de interacción
    activarEventosMunicipios();
    activarBuscadorMunicipios();

  } catch (error) {
    detail.innerHTML = "<p>Error al cargar detalle.</p>";
  }
}

/* =========================
   EVENTOS MUNICIPIOS (ACCORDION)
========================= */
function activarEventosMunicipios() {
  const items = document.querySelectorAll(".municipio-item");

  items.forEach(item => {
    item.addEventListener("click", async function () {
      const id = this.dataset.id;
      const body = document.getElementById(`municipio-${id}`);

      // Cerrar otros municipios abiertos
      document.querySelectorAll(".municipio-body").forEach(b => {
        if (b !== body) b.classList.remove("active");
      });

      // Si ya está activo, cerrarlo y salir
      if (body.classList.contains("active")) {
        body.classList.remove("active");
        return;
      }

      // Si el contenido está vacío, llamar a la API (Cache)
      if (body.innerHTML === "") {
        body.innerHTML = "<p>Cargando datos...</p>";
        body.classList.add("active");

        try {
          const res = await fetch(`https://api-colombia.com/api/v1/City/${id}`);
          const city = await res.json();

          body.innerHTML = `
            <div class="municipio-info">
              <p><strong>Descripción:</strong> ${city.description || "No disponible"}</p>
              <p><strong>Población:</strong> ${city.population ? city.population.toLocaleString() : "No disponible"}</p>
              <p><strong>Superficie:</strong> ${city.surface ? city.surface.toLocaleString() + " km²" : "No disponible"}</p>
              <p><strong>Código postal:</strong> ${city.postalCode || "No disponible"}</p>
            </div>
          `;
        } catch {
          body.innerHTML = "<p>Error al cargar municipio.</p>";
        }
      } else {
        body.classList.add("active");
      }
    });
  });
}

/* =========================
   BUSCADOR MUNICIPIOS
========================= */
function activarBuscadorMunicipios() {
  const input = document.getElementById("municipioSearch");
  const items = document.querySelectorAll(".municipio-item");

  if(!input) return;

  input.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    items.forEach(item => {
      const nombre = item.querySelector(".municipio-header").textContent.toLowerCase();
      item.style.display = nombre.includes(value) ? "block" : "none";
    });
  });
}

// Iniciar aplicación
loadDepartments();