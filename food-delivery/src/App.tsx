import React from 'react';
import { IonApp } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';


const App: React.FC = () => (
  <IonApp>
    <BrowserRouter>
      <AppRoutes />
      
    </BrowserRouter>
  </IonApp>
);

export default App;