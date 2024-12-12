// Importar el cliente de Supabase
import { supabase } from './supabaseClient.js';


// Variables globales para la fecha actual
let currentDate = new Date();

// Variables globales para los porcentajes
let percentage30 = 0.3;
let percentage50 = 0.5;
let percentage20 = 0.2;

// Función para obtener la fecha y hora actuales
function setCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS

    document.getElementById('date').value = date;
    document.getElementById('time').value = time;
}


// Función para obtener ingresos totales por día en la última semana (solo martes a sábado)
async function fetchWeeklyIncomeData() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Últimos 7 días

    const labels = ['MA', 'MI', 'JU', 'VI', 'SA']; // Solo martes a sábado
    const incomeData = [0, 0, 0, 0, 0]; // Inicializar ingresos solo para martes a sábado

    try {
        const { data, error } = await supabase
            .from('services')
            .select('date, price')
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0]);

        if (error) {
            throw error;
        }

        // Calcular ingresos totales solo para los días seleccionados (martes a sábado)
        data.forEach(entry => {
            const date = new Date(entry.date);
            const dayOfWeek = date.getDay(); // 0 (Domingo) a 6 (Sábado)

            // Mapear días de la semana a índices en el array de ingresos
            if (dayOfWeek >= 2 && dayOfWeek <= 6) { // Solo martes (2) a sábado (6)
                const index = dayOfWeek - 2; // Ajustar el índice para que martes sea 0
                incomeData[index] += entry.price; // Sumar precio al día correspondiente
            }
        });

        return { labels, incomeData };
    } catch (error) {
        console.error('Error al obtener los datos de ingresos de la semana:', error.message);
        return { labels, incomeData: [0, 0, 0, 0, 0] }; // Devuelve array vacío si hay error
    }
}

// Función para inicializar y actualizar el gráfico
async function initializeIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    const { labels, incomeData } = await fetchWeeklyIncomeData();

    const incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ingresos',
                data: incomeData, // Datos de los ingresos dinámicamente
                backgroundColor: [
                    'rgba(200, 200, 200, 0.7)',
                    'rgba(200, 200, 200, 0.7)',
                    'rgba(200, 200, 200, 0.7)',
                    'rgba(200, 200, 200, 0.7)',
                    'rgba(50, 50, 50, 1)'
                ],
                borderColor: [
                    'rgba(200, 200, 200, 1)',
                    'rgba(200, 200, 200, 1)',
                    'rgba(200, 200, 200, 1)',
                    'rgba(200, 200, 200, 1)',
                    'rgba(50, 50, 50, 1)'
                ],
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.6,
                categoryPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    return incomeChart;
}


// Función para obtener el total de ventas del día
async function fetchDailyTotal(date) {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('price')
            .eq('date', date);

        if (error) {
            throw error;
        }

        const total = data.reduce((acc, curr) => acc + curr.price, 0);
        return total;
    } catch (error) {
        console.error('Error al obtener el total de ventas del día:', error.message);
        return 0;
    }
}



function calculateAndDisplayResults(total) {
    const retirable = (total * percentage30).toFixed(2);
    const guardar = (total * percentage50).toFixed(2);
    const extra = (total * percentage20).toFixed(2);

    const totalIngresosDiaElem = document.getElementById('totalIngresosDia');
    const retirableElem = document.getElementById('retirable');
    const guardarElem = document.getElementById('guardar');
    const extraElem = document.getElementById('extra');  // Agregamos el elemento extra

    if (totalIngresosDiaElem) {
        totalIngresosDiaElem.textContent = total.toFixed(2);
    } else {
        console.error('Elemento totalIngresosDia no encontrado.');
    }

    if (retirableElem) {
        retirableElem.textContent = retirable;
    } else {
        console.error('Elemento retirable no encontrado.');
    }

    if (guardarElem) {
        guardarElem.textContent = guardar;
    } else {
        console.error('Elemento guardar no encontrado.');
    }

    if (extraElem) {
        extraElem.textContent = extra;  // Agregamos el valor extra
    } else {
        console.error('Elemento extra no encontrado.');
    }
}



// Función para cargar los datos y calcular los resultados para una fecha específica
async function loadSalesDataForDate(date) {
    const total = await fetchDailyTotal(date);
    calculateAndDisplayResults(total);
}


// Ejecutar la función para cargar los datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await loadPercentagesFromSupabase(); // Cargar porcentajes desde Supabase
    populateServiceSelect();
    fetchServicesFromSupabase();
    setCurrentDateTime();
    updateDisplayedDate();
    loadSalesDataForDate(currentDate.toISOString().split('T')[0]);
    initializeIncomeChart();
    document.getElementById('updatePercentagesBtn').addEventListener('click', updatePercentages);
});


// Función para formatear la fecha en un formato legible
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Función para actualizar la fecha mostrada en la UI
function updateDisplayedDate() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
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

// Función para obtener datos de la tabla 'services' en Supabase
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

// Función para filtrar los datos por la fecha actual
function filterServicesByDate(services, date) {
    return services.filter(service => service.date === date.toISOString().split('T')[0]);
}

// Función para mostrar los datos de 'services' en HTML
function displayServicesData(services) {
    const serviceList = document.getElementById('service-list');
    serviceList.innerHTML = ''; // Limpia la lista actual

    const filteredServices = filterServicesByDate(services, currentDate);

    filteredServices.forEach(service => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.setAttribute('data-date', service.date);
        listItem.setAttribute('data-id', service.id); // Usar el ID del servicio para futuras acciones

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

        // Añadir un evento de clic para abrir el modal
        listItem.addEventListener('click', () => {
            // Abrir el modal
            const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
            modal.show();

            // Configurar botones del modal con el ID del servicio seleccionado
            document.getElementById('modifyButton').onclick = () => modifyService(service.id);
            document.getElementById('deleteButton').onclick = () => deleteService(service.id);
        });

        serviceList.appendChild(listItem);
    });
}

// Función para eliminar un servicio de la base de datos
async function deleteService(serviceId) {
    const confirmation = confirm("¿Estás seguro de que deseas eliminar este servicio?");
    if (!confirmation) return;

    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);

        if (error) {
            console.error('Error al eliminar el servicio:', error.message);
            alert('Hubo un error al eliminar el servicio.');
        } else {
            alert('Servicio eliminado exitosamente.');

            // Cierra el modal después de eliminar
            const modalElement = document.getElementById('serviceModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            // Vuelve a cargar los datos después de eliminar
            fetchServicesFromSupabase();
        }
    } catch (error) {
        console.error('Error al comunicarse con Supabase:', error);
        alert('Error al eliminar el servicio.');
    }
    loadSalesDataForDate(currentDate.toISOString().split('T')[0])
}

// Función para modificar el precio o método de pago de un servicio
async function modifyService(serviceId) {
    const newPrice = prompt("Ingrese el nuevo precio:");
    const newPaymentMethod = prompt("Ingrese el nuevo método de pago:");

    if (newPrice === null || newPaymentMethod === null) return; // El usuario canceló

    try {
        const { error } = await supabase
            .from('services')
            .update({ price: newPrice, payment_method: newPaymentMethod })
            .eq('id', serviceId);

        if (error) {
            console.error('Error al modificar el servicio:', error.message);
            alert('Hubo un error al modificar el servicio.');
        } else {
            alert('Servicio modificado exitosamente.');
            // Vuelve a cargar los datos después de modificar
            fetchServicesFromSupabase();
        }
    } catch (error) {
        console.error('Error al comunicarse con Supabase:', error);
        alert('Error al modificar el servicio.');
    }
    
}


// Función para agregar servicio a la base de datos de Supabase
async function addServiceToDatabase(serviceName, paymentMethod, price, time, date) {
    const { data, error } = await supabase
        .from('services')
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
                    // Cierra el modal después de eliminar
                    const modalElement = document.getElementById('exampleModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
        fetchServicesFromSupabase(); // Actualizar la lista de servicios
        loadSalesDataForDate(currentDate.toISOString().split('T')[0])// Actualizar los resultados del día
    }
}

// Manejar el envío del formulario
document.getElementById('serviceForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar recarga de página

    // Inicializar la fecha y hora actuales
    setCurrentDateTime();

    // Obtener valores de los campos del formulario
    const serviceName = document.getElementById('serviceName').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const price = parseFloat(document.getElementById('price').value);
    const time = document.getElementById('time').value;
    const date = document.getElementById('date').value;

    // Llamar a la función para agregar a la base de datos
    await addServiceToDatabase(serviceName, paymentMethod, price, time, date);
    loadDailySalesData(); // Recalcular los resultados después de agregar un nuevo servicio
});

// Controladores de eventos para botones de navegación de fecha
document.getElementById('prev-date').addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDisplayedDate();
    fetchServicesFromSupabase();
    loadSalesDataForDate(currentDate.toISOString().split('T')[0]); // Actualizar los datos para la nueva fecha
});

document.getElementById('next-date').addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDisplayedDate();
    fetchServicesFromSupabase();
    loadSalesDataForDate(currentDate.toISOString().split('T')[0]); // Actualizar los datos para la nueva fecha
});

// Función para cargar los porcentajes desde Supabase
async function loadPercentagesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('configurations')
            .select('name, value');

        if (error) throw error;

        data.forEach(config => {
            switch(config.name) {
                case 'percentage_retirable':
                    percentage30 = config.value / 100;
                    break;
                case 'percentage_guardar':
                    percentage50 = config.value / 100;
                    break;
                case 'percentage_extra':
                    percentage20 = config.value / 100;
                    break;
            }
        });

        // Actualizar la UI si es necesario
        updatePercentagesDisplay();
    } catch (error) {
        console.error('Error al cargar porcentajes:', error.message);
        alert('Error al cargar la configuración');
    }
}

// Función para actualizar los porcentajes en Supabase
async function updatePercentagesInSupabase(p30, p50, p20) {
    try {
        const updates = [
            {
                name: 'percentage_retirable',
                value: p30 * 100
            },
            {
                name: 'percentage_guardar',
                value: p50 * 100
            },
            {
                name: 'percentage_extra',
                value: p20 * 100
            }
        ];

        for (const update of updates) {
            const { error } = await supabase
                .from('configurations')
                .update({ value: update.value })
                .eq('name', update.name);

            if (error) throw error;
        }

        return true;
    } catch (error) {
        console.error('Error al actualizar porcentajes:', error.message);
        return false;
    }
}

// Función para mostrar el modal de configuración
window.updatePercentages = async function() {
    const modal = new bootstrap.Modal(document.getElementById('configModal'));
    
    // Mostrar los valores actuales
    document.getElementById('percentage30Input').value = (percentage30 * 100).toFixed(0);
    document.getElementById('percentage50Input').value = (percentage50 * 100).toFixed(0);
    document.getElementById('percentage20Input').value = (percentage20 * 100).toFixed(0);
    
    modal.show();
}

// Función para guardar los nuevos porcentajes
window.savePercentages = async function() {
    const p30 = parseFloat(document.getElementById('percentage30Input').value) / 100;
    const p50 = parseFloat(document.getElementById('percentage50Input').value) / 100;
    const p20 = parseFloat(document.getElementById('percentage20Input').value) / 100;
    
    // Validar que los porcentajes sumen 100%
    if ((p30 + p50 + p20).toFixed(2) !== '1.00') {
        alert('Los porcentajes deben sumar 100%');
        return;
    }
    
    // Actualizar en Supabase
    const success = await updatePercentagesInSupabase(p30, p50, p20);
    
    if (success) {
        // Actualizar variables locales
        percentage30 = p30;
        percentage50 = p50;
        percentage20 = p20;
        
        // Recalcular los resultados
        loadSalesDataForDate(currentDate.toISOString().split('T')[0]);
        
        // Cerrar el modal
        const modalElement = document.getElementById('configModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        
        alert('Configuración guardada exitosamente');
    } else {
        alert('Error al guardar la configuración');
    }
}

// Función para actualizar la visualización de los porcentajes en la UI
function updatePercentagesDisplay() {
    // Actualizar elementos de la UI que muestran los porcentajes
    const retirablePercentElem = document.getElementById('retirablePercent');
    const guardarPercentElem = document.getElementById('guardarPercent');
    const extraPercentElem = document.getElementById('extraPercent');

    if (retirablePercentElem) retirablePercentElem.textContent = `${(percentage30 * 100).toFixed(0)}%`;
    if (guardarPercentElem) guardarPercentElem.textContent = `${(percentage50 * 100).toFixed(0)}%`;
    if (extraPercentElem) extraPercentElem.textContent = `${(percentage20 * 100).toFixed(0)}%`;
}
