// Importar el cliente de Supabase
import { supabase } from './supabaseClient.js';

// Función para obtener la fecha y hora actuales
function setCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS

    document.getElementById('date').value = date;
    document.getElementById('time').value = time;
}

// Función para obtener datos de la tabla 'inventory'
async function fetchInventoryData() {
    try {
        const { data, error } = await supabase
            .from('inventory')  // Reemplaza 'inventory' con el nombre de tu tabla
            .select('serviceName, price');

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error al obtener datos de la tabla inventory:', error.message);
        return null;
    }
}

// Función para llenar el select de servicios con datos de 'inventory'
async function populateServiceSelect() {
    const inventoryData = await fetchInventoryData();

    if (inventoryData && inventoryData.length > 0) {
        const serviceSelect = document.getElementById('serviceName');
        
        // Llenar el select con opciones
        inventoryData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.serviceName;
            option.textContent = item.serviceName;
            option.dataset.price = item.price; // Usar dataset para almacenar el precio
            serviceSelect.appendChild(option);
        });

        // Agregar un listener para actualizar el precio cuando se seleccione un servicio
        serviceSelect.addEventListener('change', function() {
            const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
            document.getElementById('price').value = selectedOption.dataset.price;
        });
    }
}

// Nueva función para obtener datos de la tabla 'services' en Supabase
async function fetchServicesFromSupabase() {
    try {
        const { data: services, error } = await supabase
            .from('services')  // Reemplaza 'services' con el nombre de tu tabla
            .select('*');

        if (error) {
            console.error('Error al obtener los datos:', error.message);
            return;
        }

        // Llamar a la función para mostrar los datos en HTML
        displayServicesData(services);
    } catch (error) {
        console.error('Error al conectar con Supabase:', error);
    }
}

// Nueva función para mostrar los datos de 'services' en HTML
function displayServicesData(services) {
    const serviceList = document.getElementById('service-list');
    serviceList.innerHTML = ''; // Limpia la lista actual

    services.forEach(service => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.setAttribute('data-date', service.date);

        listItem.innerHTML = `
            <div class="service-info d-flex align-items-center">
                <i class="fas fa-cut icon"></i> <!-- Suponiendo que todos los servicios usan el mismo icono -->
                <div class="ms-3">
                    <span class="fw-bold">${service.name}</span>
                    <div class="text-muted">${service.payment_method}</div>
                </div>
            </div>
            <div class="text-end">
                <span class="fw-bold">${service.price}</span>
                <div class="text-muted small">${service.time}</div>
            </div>
        `;

        serviceList.appendChild(listItem);
    });
}

// Función para agregar servicio a la base de datos de Supabase
async function addServiceToDatabase(serviceName, paymentMethod, price, time, date) {
    const { data, error } = await supabase
        .from('services')  // Reemplaza 'services' con el nombre de tu tabla
        .insert([
            { 
                name: serviceName, 
                payment_method: paymentMethod, 
                price: price, 
                time: time,
                date: date 
            }
        ]);

    if (error) {
        console.error('Error al insertar datos:', error.message);
        alert('Error al agregar el servicio: ' + error.message);
    } else {
        console.log('Servicio agregado:', data);
        alert('Servicio agregado exitosamente');
        document.getElementById('serviceForm').reset();
        
        // Volver a cargar los servicios después de agregar uno nuevo
        fetchServicesFromSupabase();
    }
}

// Manejar el envío del formulario
document.getElementById('serviceForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar recarga de página

    // Obtener valores de los campos del formulario
    const serviceName = document.getElementById('serviceName').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const price = parseFloat(document.getElementById('price').value);
    const time = document.getElementById('time').value;
    const date = document.getElementById('date').value;

    // Llamar a la función para agregar a la base de datos
    await addServiceToDatabase(serviceName, paymentMethod, price, time, date);
});

// Llenar el select de servicios automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    populateServiceSelect();
    fetchServicesFromSupabase(); // Cargar los servicios existentes al cargar la página
    setCurrentDateTime(); // Configurar la fecha y hora actuales
});
