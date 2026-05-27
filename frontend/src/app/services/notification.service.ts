import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  showSuccess(message: string): void {
    this.createToast(message, 'toast-success');
  }

  showError(message: string): void {
    this.createToast(message, 'toast-error');
  }

  showWarning(message: string): void {
    this.createToast(message, 'toast-warning');
  }

  private createToast(message: string, typeClass: string): void {
    // Buscar contenedor o crearlo
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      // Estilo brutalista del contenedor
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${typeClass}`;
    toast.innerText = message;
    
    // Aplicar estilos brutales directos para asegurar consistencia
    toast.style.padding = '1rem 1.5rem';
    toast.style.border = '2px solid';
    toast.style.fontFamily = "'JetBrains Mono', monospace";
    toast.style.fontSize = '0.85rem';
    toast.style.fontWeight = '700';
    toast.style.textTransform = 'uppercase';
    toast.style.boxShadow = '4px 4px 0px rgba(0, 0, 0, 0.3)';
    toast.style.transition = 'opacity 0.2s, transform 0.2s';
    
    if (typeClass === 'toast-success') {
      toast.style.backgroundColor = '#10b981';
      toast.style.borderColor = '#047857';
      toast.style.color = '#fff';
    } else if (typeClass === 'toast-error') {
      toast.style.backgroundColor = '#ef4444';
      toast.style.borderColor = '#b91c1c';
      toast.style.color = '#fff';
    } else {
      toast.style.backgroundColor = '#f59e0b';
      toast.style.borderColor = '#d97706';
      toast.style.color = '#000';
    }

    container.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
    }, 10);

    // Remover toast automáticamente
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    }, 3500);
  }
}
