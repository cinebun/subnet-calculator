<template>
  <div id="app">
    <div class="app-container">
      <div class="app-header">
        <div class="logo">
          <span class="logo-icon">🔧</span>
          <h1>Network Calculator Pro</h1>
        </div>
        <p class="tagline">Профессиональный инструмент для сетевых расчетов</p>
      </div>
      
      <main class="app-main">
        <SubnetCalculator />
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>Калькулятор подсетей v2.0 • Используйте для расчета сетевых параметров</p>
          <p class="footer-hint">
            💡 <strong>Подсказка:</strong> Введите IP-адрес и выберите маску для автоматического расчета
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import SubnetCalculator from "./components/SubnetCalculator.vue"
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2ff 100%);
  min-height: 100vh;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.app-container {
  width: 100%;
  max-width: 1100px;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.logo h1 {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.app-main {
  flex: 1;
  background: white;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.app-footer {
  margin-top: 2rem;
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
}

.footer-content {
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.footer-hint {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #ebf8ff;
  border-radius: 10px;
  color: #2b6cb0;
  font-size: 0.95rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .app-header {
    padding: 1.5rem 1rem;
  }
  
  .logo h1 {
    font-size: 1.8rem;
  }
  
  .tagline {
    font-size: 1rem;
  }
  
  .app-main {
    border-radius: 0 0 16px 16px;
  }
}
</style>