<template>
  <div class="calculator">
    <div class="header">
      <h1>🔧 Калькулятор подсетей</h1>
      <p class="subtitle">Расчет сетевых параметров по IP-адресу и маске</p>
    </div>

    <div class="input-section">
      <!-- IP Address Input -->
      <div class="input-group">
        <label for="ip-address">
          <span class="label-icon">📡</span> IP-адрес:
        </label>
        <div class="input-with-validation">
          <input
            id="ip-address"
            v-model="ipAddress"
            type="text"
            placeholder="192.168.1.1"
            :class="{ 'error': ipError }"
            @input="validateIp"
          />
          <div class="hint">Формат: xxx.xxx.xxx.xxx (0-255)</div>
        </div>
      </div>

      <!-- Subnet Mask Selection -->
      <div class="input-group">
        <label for="subnet-mask">
          <span class="label-icon">🛡️</span> Маска подсети:
        </label>
        <div class="mask-selector">
          <div class="mask-buttons">
            <button
              v-for="mask in commonMasks"
              :key="mask.value"
              @click="selectMask(mask.value)"
              :class="{ 'active': selectedMask === mask.value }"
              class="mask-btn"
            >
              {{ mask.label }}
            </button>
          </div>
          <select v-model="selectedMask" class="mask-dropdown">
            <option v-for="mask in allMasks" :key="mask.value" :value="mask.value">
              {{ mask.label }} ({{ mask.hosts }} хостов)
            </option>
          </select>
          <div class="current-mask">
            Текущая: <strong>{{ getMaskInfo(selectedMask).notation }}</strong>
            ({{ getMaskInfo(selectedMask).decimal }})
          </div>
        </div>
      </div>

      <!-- Custom CIDR Input -->
      <div class="input-group">
        <label for="custom-cidr">
          <span class="label-icon">🎯</span> Или укажите CIDR вручную:
        </label>
        <div class="cidr-input">
          <span class="cidr-prefix">/</span>
          <input
            id="custom-cidr"
            v-model.number="customCidr"
            type="number"
            min="1"
            max="30"
            placeholder="24"
            @input="updateFromCidr"
          />
          <div class="cidr-range">
            <input
              type="range"
              v-model.number="customCidr"
              min="1"
              max="30"
              @input="updateFromCidr"
              class="cidr-slider"
            />
            <div class="range-labels">
              <span>/1</span>
              <span>/8</span>
              <span>/16</span>
              <span>/24</span>
              <span>/30</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calculate Button -->
    <button @click="calculate" :disabled="!isValid" class="calculate-btn">
      <span class="btn-icon">🚀</span>
      Рассчитать подсеть
      <span class="btn-subtext">Нажмите или Enter</span>
    </button>

    <!-- Results -->
    <div v-if="results" class="results-section">
      <h2 class="results-title">
        <span class="results-icon">📊</span> Результаты расчета
      </h2>
      
      <div class="results-grid">
        <div class="result-card primary">
          <div class="card-icon">🌐</div>
          <div class="card-content">
            <h3>Сетевой адрес</h3>
            <p class="result-value">{{ results.networkAddress }}</p>
            <p class="card-description">Адрес сети, к которой принадлежит IP</p>
          </div>
        </div>

        <div class="result-card warning">
          <div class="card-icon">📢</div>
          <div class="card-content">
            <h3>Широковещательный</h3>
            <p class="result-value">{{ results.broadcastAddress }}</p>
            <p class="card-description">Адрес для broadcast-рассылки</p>
          </div>
        </div>

        <div class="result-card success">
          <div class="card-icon">🖥️</div>
          <div class="card-content">
            <h3>Доступные хосты</h3>
            <p class="result-value">{{ results.availableHosts.toLocaleString() }}</p>
            <p class="card-description">Максимальное количество устройств</p>
          </div>
        </div>

        <div class="result-card info">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3>Диапазон хостов</h3>
            <p class="result-value">{{ results.hostRange }}</p>
            <p class="card-description">Доступные IP-адреса для устройств</p>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="additional-info">
        <h3>📋 Дополнительная информация</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Класс сети:</span>
            <span class="info-value">{{ results.networkClass }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IP в двоичном виде:</span>
            <span class="info-value binary">{{ results.binaryIp }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Маска в двоичном виде:</span>
            <span class="info-value binary">{{ results.binaryMask }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Размер блока:</span>
            <span class="info-value">{{ results.blockSize }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3>Ошибка</h3>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- Quick Examples -->
    <div class="examples">
      <h3>💡 Быстрые примеры:</h3>
      <div class="example-buttons">
        <button
          v-for="example in examples"
          :key="example.label"
          @click="loadExample(example)"
          class="example-btn"
        >
          {{ example.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Реактивные данные
const ipAddress = ref('192.168.1.1')
const selectedMask = ref(24)
const customCidr = ref(24)
const results = ref(null)
const error = ref('')
const ipError = ref(false)

// Примеры для быстрой загрузки
const examples = ref([
  { label: 'Домашняя сеть', ip: '192.168.1.1', mask: 24 },
  { label: 'Маленькая сеть', ip: '10.0.0.1', mask: 28 },
  { label: 'Средняя сеть', ip: '172.16.0.1', mask: 20 },
  { label: 'Тестовая', ip: '192.168.100.50', mask: 26 }
])

// Все возможные маски
const allMasks = ref([
  { value: 30, label: '/30', hosts: '2', notation: '255.255.255.252' },
  { value: 29, label: '/29', hosts: '6', notation: '255.255.255.248' },
  { value: 28, label: '/28', hosts: '14', notation: '255.255.255.240' },
  { value: 27, label: '/27', hosts: '30', notation: '255.255.255.224' },
  { value: 26, label: '/26', hosts: '62', notation: '255.255.255.192' },
  { value: 25, label: '/25', hosts: '126', notation: '255.255.255.128' },
  { value: 24, label: '/24', hosts: '254', notation: '255.255.255.0' },
  { value: 23, label: '/23', hosts: '510', notation: '255.255.254.0' },
  { value: 22, label: '/22', hosts: '1022', notation: '255.255.252.0' },
  { value: 21, label: '/21', hosts: '2046', notation: '255.255.248.0' },
  { value: 20, label: '/20', hosts: '4094', notation: '255.255.240.0' },
  { value: 19, label: '/19', hosts: '8190', notation: '255.255.224.0' },
  { value: 18, label: '/18', hosts: '16382', notation: '255.255.192.0' },
  { value: 17, label: '/17', hosts: '32766', notation: '255.255.128.0' },
  { value: 16, label: '/16', hosts: '65534', notation: '255.255.0.0' },
  { value: 8, label: '/8', hosts: '16.7M', notation: '255.0.0.0' }
])

// Часто используемые маски
const commonMasks = computed(() => allMasks.value.filter(m => [24, 25, 26, 27, 28, 30].includes(m.value)))

// Валидация формы
const isValid = computed(() => {
  return !ipError.value && ipAddress.value.trim() !== '' && selectedMask.value >= 1 && selectedMask.value <= 30
})

// Получить информацию о маске
const getMaskInfo = (maskValue) => {
  return allMasks.value.find(m => m.value === maskValue) || allMasks.value[0]
}

// Выбрать маску через кнопки
const selectMask = (mask) => {
  selectedMask.value = mask
  customCidr.value = mask
}

// Обновить из CIDR
const updateFromCidr = () => {
  if (customCidr.value >= 1 && customCidr.value <= 30) {
    selectedMask.value = customCidr.value
  }
}

// Загрузить пример
const loadExample = (example) => {
  ipAddress.value = example.ip
  selectedMask.value = example.mask
  customCidr.value = example.mask
  ipError.value = false
  calculate()
}

// Валидация IP
const validateIp = () => {
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = ipAddress.value.match(ipPattern)
  
  if (!match) {
    ipError.value = true
    return false
  }

  // Проверка каждого октета
  for (let i = 1; i <= 4; i++) {
    const octet = parseInt(match[i])
    if (octet < 0 || octet > 255) {
      ipError.value = true
      return false
    }
  }

  ipError.value = false
  return true
}

// Преобразовать IP в число
const ipToNumber = (ip) => {
  const parts = ip.split('.').map(Number)
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

// Преобразовать число в IP
const numberToIp = (num) => {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.')
}

// Получить двоичное представление
const toBinary = (ip) => {
  return ip.split('.').map(octet => {
    return parseInt(octet).toString(2).padStart(8, '0')
  }).join('.')
}

// Определить класс сети
const getNetworkClass = (firstOctet) => {
  if (firstOctet <= 127) return 'A'
  if (firstOctet <= 191) return 'B'
  if (firstOctet <= 223) return 'C'
  if (firstOctet <= 239) return 'D (multicast)'
  return 'E (experimental)'
}

// Основная функция расчета
const calculate = () => {
  error.value = ''
  results.value = null

  // Валидация IP
  if (!validateIp()) {
    error.value = 'Некорректный IP-адрес. Используйте формат 0-255.0-255.0-255.0-255'
    return
  }

  try {
    const ip = ipAddress.value
    const maskBits = selectedMask.value
    
    // Преобразуем IP в число
    const ipNum = ipToNumber(ip)
    
    // Создаем маску
    const mask = 0xFFFFFFFF << (32 - maskBits)
    
    // Сетевой адрес
    const networkAddress = numberToIp(ipNum & mask)
    
    // Широковещательный адрес
    const broadcastAddress = numberToIp(ipNum | (~mask >>> 0))
    
    // Доступные хосты
    const availableHosts = Math.pow(2, 32 - maskBits) - 2
    
    // Диапазон хостов
    const networkNum = ipNum & mask
    const firstHost = networkNum + 1
    const lastHost = (ipNum | (~mask >>> 0)) - 1
    
    const hostRange = `${numberToIp(firstHost)} - ${numberToIp(lastHost)}`
    
    // Дополнительная информация
    const firstOctet = parseInt(ip.split('.')[0])
    const networkClass = getNetworkClass(firstOctet)
    const binaryIp = toBinary(ip)
    const binaryMask = '1'.repeat(maskBits).padEnd(32, '0')
      .match(/.{8}/g)
      .map(bin => parseInt(bin, 2))
      .join('.')
    
    // Блок
    const blockSize = Math.pow(2, 32 - maskBits)
    
    // Сохраняем результаты
    results.value = {
      networkAddress: `${networkAddress}/${maskBits}`,
      broadcastAddress,
      availableHosts,
      hostRange,
      networkClass,
      binaryIp,
      binaryMask: toBinary(binaryMask),
      blockSize: blockSize.toLocaleString()
    }

  } catch (err) {
    error.value = 'Ошибка при расчете. Проверьте введенные данные.'
    console.error('Calculation error:', err)
  }
}

// Начальный расчет при загрузке
onMounted(() => {
  calculate()
})

// Следим за изменениями
watch([ipAddress, selectedMask], () => {
  if (isValid.value) {
    calculate()
  }
})
</script>

<style scoped>
.calculator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}

.input-section {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.input-group {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.input-group:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.label-icon {
  font-size: 1.2rem;
}

.input-with-validation {
  position: relative;
}

.input-with-validation input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: 'Consolas', monospace;
  transition: all 0.3s ease;
}

.input-with-validation input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-with-validation input.error {
  border-color: #fc8181;
  background: #fff5f5;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #a0aec0;
}

.mask-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mask-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mask-btn {
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mask-btn:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.mask-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.mask-dropdown {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.current-mask {
  padding: 0.75rem;
  background: #edf2f7;
  border-radius: 8px;
  text-align: center;
  font-size: 0.95rem;
  color: #4a5568;
}

.cidr-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cidr-input input[type="number"] {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  max-width: 100px;
}

.cidr-prefix {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4a5568;
  margin-right: 0.5rem;
}

.cidr-range {
  flex: 1;
}

.cidr-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.cidr-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: #a0aec0;
  font-size: 0.9rem;
}

.calculate-btn {
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.calculate-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.calculate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.5rem;
}

.btn-subtext {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 400;
}

.results-section {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: #2d3748;
}

.results-icon {
  font-size: 1.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.result-card {
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
}

.result-card.primary {
  background: linear-gradient(135deg, #ebf4ff 0%, #c3dafe 100%);
  border-left: 6px solid #4299e1;
}

.result-card.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fbd38d 100%);
  border-left: 6px solid #ed8936;
}

.result-card.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 6px solid #48bb78;
}

.result-card.info {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-left: 6px solid #667eea;
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.result-value {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-family: 'Consolas', monospace;
}

.card-description {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.additional-info {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.additional-info h3 {
  margin-bottom: 1.5rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.info-label {
  font-weight: 600;
  color: #4a5568;
}

.info-value {
  font-weight: 700;
  color: #2d3748;
  font-family: 'Consolas', monospace;
}

.info-value.binary {
  color: #667eea;
  font-size: 0.9rem;
}

.error-message {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #fff5f5;
  border-radius: 12px;
  border-left: 6px solid #fc8181;
  margin-bottom: 2rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-icon {
  font-size: 2rem;
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
  color: #c53030;
}

.error-content p {
  margin: 0;
  color: #9b2c2c;
}

.examples {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
}

.examples h3 {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.example-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.example-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .calculator {
    padding: 1rem;
    border-radius: 16px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .mask-buttons {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .mask-btn {
    white-space: nowrap;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>