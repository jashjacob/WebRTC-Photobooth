import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SessionGroup {
  id: string;
  timestamp: number;
  filmstrip: string | null;
  shots: Record<string, string>;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <h1>🔒 Photobooth Admin Dashboard</h1>
        <a href="/" class="back-link">← Back to Booth</a>
      </header>

      @if (!isAuthenticated()) {
        <div class="login-card">
          <h2>Admin Login</h2>
          <input 
            type="password" 
            #passwordInput 
            placeholder="Enter password" 
            (keydown.enter)="login(passwordInput.value)"
          />
          <button class="btn btn-primary" (click)="login(passwordInput.value)">Login</button>
          
          @if (loginError()) {
            <p class="error-text">Invalid password</p>
          }
        </div>
      } @else {
        <div class="dashboard-content">
          @if (isLoading()) {
            <div class="loading-state">Loading sessions...</div>
          } @else if (sessions().length === 0) {
            <div class="empty-state">No sessions found.</div>
          } @else {
            <div class="sessions-grid">
              @for (session of sessions(); track session.id) {
                <div class="session-card">
                  <div class="session-header">
                    <h3>Session {{ session.id.substring(0, 8) }}</h3>
                    <span class="timestamp">{{ session.timestamp | date:'medium' }}</span>
                  </div>
                  
                  <div class="session-media">
                    <div class="shots-grid">
                      <p class="section-label">Raw Frames</p>
                      <div class="shots-container">
                        @if (session.shots['shot-1']) { <img [src]="session.shots['shot-1']" class="raw-shot"> }
                        @if (session.shots['shot-2']) { <img [src]="session.shots['shot-2']" class="raw-shot"> }
                        @if (session.shots['shot-3']) { <img [src]="session.shots['shot-3']" class="raw-shot"> }
                        @if (session.shots['shot-4']) { <img [src]="session.shots['shot-4']" class="raw-shot"> }
                        @if (session.shots['shot-single']) { <img [src]="session.shots['shot-single']" class="raw-shot"> }
                      </div>
                    </div>
                    
                    <div class="filmstrip-container">
                      <p class="section-label">Final Strip</p>
                      @if (session.filmstrip) {
                        <img [src]="session.filmstrip" class="filmstrip-image">
                      } @else {
                        <div class="no-strip">Pending...</div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 32px;
      font-family: 'Nunito', sans-serif;
      color: #333;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }

    .admin-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }

    .back-link {
      color: #0984e3;
      text-decoration: none;
      font-weight: bold;
    }

    .login-card {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }

    .login-card input {
      width: 100%;
      padding: 12px;
      margin: 16px 0;
      border: 1px solid #dfe6e9;
      border-radius: 6px;
      box-sizing: border-box;
      font-size: 1rem;
    }

    .btn {
      width: 100%;
      padding: 12px;
      background: #0984e3;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn:hover {
      background: #74b9ff;
    }

    .error-text {
      color: #d63031;
      margin-top: 12px;
      font-size: 0.9rem;
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
      gap: 24px;
    }

    .session-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 12px;
    }

    .session-header h3 {
      margin: 0;
      color: #2d3436;
    }

    .timestamp {
      color: #636e72;
      font-size: 0.9rem;
    }

    .session-media {
      display: flex;
      gap: 24px;
    }

    .shots-grid {
      flex: 1;
    }

    .shots-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .raw-shot {
      width: 100%;
      height: auto;
      border-radius: 6px;
      object-fit: cover;
      aspect-ratio: 4/3;
      background: #eee;
    }

    .filmstrip-container {
      width: 180px;
      flex-shrink: 0;
    }

    .filmstrip-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .section-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #b2bec3;
      margin: 0 0 12px 0;
      font-weight: bold;
    }

    .no-strip {
      width: 100%;
      height: 300px;
      background: #f1f2f6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a4b0be;
    }
  `]
})
export class AdminDashboardComponent {
  isAuthenticated = signal(false);
  loginError = signal(false);
  isLoading = signal(false);
  sessions = signal<SessionGroup[]>([]);
  private password = '';

  async login(password: string) {
    if (!password) return;
    this.password = password;
    
    // Test auth by fetching sessions immediately
    this.isLoading.set(true);
    this.loginError.set(false);

    try {
      const response = await fetch('/api/admin', {
        headers: {
          'Authorization': `Bearer ${this.password}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.sessions.set(data.sessions || []);
        this.isAuthenticated.set(true);
      } else {
        this.loginError.set(true);
      }
    } catch (e) {
      this.loginError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
