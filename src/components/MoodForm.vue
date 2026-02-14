<template>
  <div class="full-page-wrapper">
    
    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>The AI is thinking...</p>
        </div>
      </div>
    </transition>

    <main class="pc-dashboard">
      
      <aside class="sidebar">
        <div class="sidebar-inner">
          <div class="logo">
            <h2>🌿 Mindful<span>PC</span></h2>
          </div>

          <div v-if="errorMessage" class="error-box">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input v-model="name" placeholder="Who's checking in?" :disabled="loading" />
          </div>

          <div class="form-group">
            <label>How are you feeling?</label>
            <textarea v-model="mood" placeholder="Write something..." :disabled="loading"></textarea>
          </div>

          <button @click="submitMood" :disabled="loading" class="submit-button">
            {{ loading ? 'Generating AI Response...' : 'Submit to AI' }}
          </button>

          <transition name="slide">
            <div v-if="aiMessage && !loading" class="ai-box">
              <small>LATEST AI ADVISOR</small>
              <p>{{ aiMessage }}</p>
            </div>
          </transition>
        </div>
      </aside>

      <section class="history-feed">
        <header class="feed-header">
          <h2>Mood History Feed</h2>
          <div class="entry-count">{{ history.length }} entries</div>
        </header>

        <div class="history-scroll-container">
          <div v-for="entry in history" :key="entry.id" class="history-row">
            <div class="user-profile">
              <div class="avatar">{{ entry.full_name ? entry.full_name[0].toUpperCase() : '?' }}</div>
              <div class="user-meta">
                <span class="user-name">{{ entry.full_name }}</span>
                <span class="timestamp">{{ formatDate(entry.created_at) }}</span>
              </div>
            </div>

            <div class="content-block">
              <p class="user-mood">"{{ entry.mood_text }}"</p>
              <div v-if="entry.ai_message" class="ai-reply">
                <strong>AI Feedback:</strong> {{ entry.ai_message }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      name: '',
      mood: '',
      aiMessage: '',
      errorMessage: '',
      loading: false, // Eto ang nag-to-toggle ng spinner
      history: []
    };
  },
  methods: {
    async fetchHistory() {
      try {
        const res = await api.get('/moods');
        this.history = res.data;
      } catch (err) {
        this.errorMessage = "Could not refresh history.";
      }
    },
    async submitMood() {
      if (!this.name || !this.mood) return alert("Fill out both fields!");
      
      this.loading = true; // START LOADING: Lalabas ang spinner
      this.errorMessage = '';
      this.aiMessage = '';

      try {
        const res = await api.post('/moods', {
          full_name: this.name,
          mood_text: this.mood
        });
        
        // Kapag nandito na ang data, tapos na ang loading
        this.aiMessage = res.data.aiMessage;
        this.mood = ''; 
        await this.fetchHistory();
      } catch (err) {
        this.errorMessage = "Connection error. Please try again.";
      } finally {
        this.loading = false; // STOP LOADING: Mawawala ang spinner
      }
    },
    formatDate(d) {
      return new Date(d).toLocaleString([], { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    }
  },
  mounted() {
    this.fetchHistory();
  }
}
</script>

<style scoped>
/* --- SPINNER OVERLAY STYLES --- */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.85); /* Semi-transparent white */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.spinner-container {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #000; /* Black spinner head */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- DASHBOARD LAYOUT --- */
.full-page-wrapper {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: #f8fafc; overflow: hidden; color: #000 !important;
}

.pc-dashboard { display: grid; grid-template-columns: 380px 1fr; width: 100%; height: 100%; }

.sidebar {
  background: white; border-right: 2px solid #000;
  padding: 40px 30px; box-sizing: border-box; text-align: left;
}

.logo h2 { margin-bottom: 30px; font-weight: 900; }
.logo span { color: #10b981; }

.form-group { margin-bottom: 20px; }
label { display: block; font-weight: bold; margin-bottom: 5px; }

input, textarea {
  width: 100%; padding: 12px; border: 2px solid #000; border-radius: 8px; color: #000;
}
textarea { height: 120px; resize: none; }

.submit-button {
  width: 100%; padding: 15px; background: #000; color: #fff !important;
  border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
}

.submit-button:disabled { background: #555; cursor: not-allowed; }

.ai-box {
  margin-top: 25px; padding: 20px; border: 2px solid #000;
  background: #f0fdf4; border-radius: 8px;
}

/* --- HISTORY AREA --- */
.history-feed { padding: 40px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }

.feed-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px;
}

.history-scroll-container {
  overflow-y: auto; flex-grow: 1; padding-right: 15px; text-align: left;
}

.history-row {
  display: grid; grid-template-columns: 200px 1fr;
  background: white; border: 2px solid #000; border-radius: 12px;
  padding: 20px; margin-bottom: 20px;
}

.user-profile { display: flex; align-items: start; gap: 12px; }
.user-meta { display: flex; flex-direction: column; gap: 2px; }
.user-name { font-weight: 900; font-size: 1rem; }
.timestamp { font-size: 0.75rem; opacity: 0.7; }

.avatar {
  width: 35px; height: 35px; background: #000; color: #fff !important;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;
}

.user-mood { font-size: 1.1rem; font-style: italic; margin-bottom: 10px; }
.ai-reply {
  padding: 12px; border: 1px dashed #000; background: #f8fafc; border-radius: 6px;
}

/* Global Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }

/* Force Black Text */
* { color: #000 !important; }
.submit-button, .avatar, .spinner { color: #fff !important; }

/* Custom Scrollbar */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
</style>