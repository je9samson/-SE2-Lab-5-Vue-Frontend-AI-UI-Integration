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
                <div class="user-name">{{ entry.full_name }}</div>
                <div class="timestamp">{{ formatDate(entry.created_at) }}</div>
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
export default {
  data() {
    return {
      name: '',
      mood: '',
      aiMessage: '',
      errorMessage: '',
      loading: false,
      history: []
    };
  },
  methods: {
    async fetchHistory() {
      try {
        const response = await fetch('http://localhost:10000/moods');
        if (response.ok) {
          this.history = await response.json();
        }
      } catch (err) {
        console.error("History fetch failed:", err);
      }
    },

    async submitMood() {
      if (!this.name || !this.mood) return alert("Fill out both fields!");
      
      this.loading = true; 
      this.errorMessage = "";
      
      const lowerMood = this.mood.toLowerCase();
      const responses = {
        sad: ["I'm sorry you're feeling down...", "It's okay to feel sad.", "Sending a virtual hug!"],
        anxious: ["Take a deep breath...", "Focus on the present.", "You've got this."],
        happy: ["That's amazing!", "Keep that energy going!", "So glad to hear that!"],
        default: ["Thank you for sharing.", "Mindfulness is a great first step."]
      };
      const pick = (list) => list[Math.floor(Math.random() * list.length)];
      
      let dynamicResponse = pick(responses.default);
      if (lowerMood.includes("sad")) dynamicResponse = pick(responses.sad);
      else if (lowerMood.includes("anxious")) dynamicResponse = pick(responses.anxious);
      else if (lowerMood.includes("happy")) dynamicResponse = pick(responses.happy);

      try {
        const response = await fetch("http://localhost:10000/moods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            full_name: this.name, 
            mood_text: this.mood,
            ai_message: dynamicResponse 
          })
        });

        if (response.ok) {
          this.aiMessage = dynamicResponse;
          this.mood = ''; 
          await this.fetchHistory();
        } else {
          this.errorMessage = "Server error. Check your database.";
        }
      } catch (err) {
        this.errorMessage = "Connection error. Is the backend running?";
      } finally {
        this.loading = false; 
      }
    },

    formatDate(d) {
      if (!d) return "Just now";
      const date = new Date(d);
      if (isNaN(date)) return "Just now";
      return date.toLocaleString([], { 
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
/* SPINNER & OVERLAY */
.loading-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(255, 255, 255, 0.9); display: flex;
  justify-content: center; align-items: center; z-index: 999;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* DASHBOARD LAYOUT */
.full-page-wrapper {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: #f8fafc; overflow: hidden;
}
.pc-dashboard { display: grid; grid-template-columns: 380px 1fr; width: 100%; height: 100%; }

/* SIDEBAR */
.sidebar {
  background: #ffffff; border-right: 2px solid #e2e8f0;
  padding: 40px 30px; text-align: left;
}
.logo h2 { margin-bottom: 30px; font-weight: 800; color: #1e293b !important; }
.logo span { color: #10b981 !important; }

/* FORMS */
.form-group { margin-bottom: 20px; }
label { display: block; font-weight: 700; margin-bottom: 8px; color: #475569 !important; }
input, textarea {
  width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 8px;
  background: #fff; color: #1e293b !important;
}
.submit-button {
  width: 100%; padding: 14px; background: #1e293b; color: #fff !important;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
}

/* AI MESSAGE BOX */
.ai-box {
  margin-top: 25px; padding: 20px; background: #f1f5f9;
  border-radius: 12px; border-left: 5px solid #10b981;
}

/* HISTORY FEED */
.history-feed { padding: 40px; background: #f8fafc; overflow-y: auto; text-align: left; }
.feed-header { 
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px;
}

/* ROW & PROFILE */
.history-row {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  display: grid; grid-template-columns: 200px 1fr;
}
.user-profile { display: flex; align-items: center; }

/* UPDATED: Meta Stacking Logic */
.user-meta {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
}
.user-name { font-weight: 700; color: #1e293b !important; line-height: 1.2; }
.timestamp { 
  font-size: 0.75rem; 
  color: #64748b !important; 
  margin-top: 2px;
}

.avatar {
  width: 36px; height: 36px; background: #10b981; color: #fff !important;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;
}

.ai-reply { 
  margin-top: 10px; padding: 12px; background: #f0fdf4; 
  border-radius: 8px; font-size: 0.9rem; color: #166534 !important;
}

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-enter { transform: translateY(20px); opacity: 0; }

/* TEXT COLOR OVERRIDE */
h2, p, span, label, input, textarea, small, .user-name { color: #1e293b !important; }
.error-box { color: #dc2626 !important; font-weight: bold; margin-bottom: 15px; }
</style>