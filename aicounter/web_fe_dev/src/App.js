import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/home';
import { ViewKamera } from './pages/view_kamera';
import { SettingDevice } from './pages/setting_device';
import { SettingKamera } from './pages/setting_kamera';
import { DataKamera } from './pages/data_kamera';
import { SettingPdDevice } from './pages/setting_pd_device';

const setting = require('./setting.json');


function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={
                    <>
                        <Home />
                    </>
                } />

                <Route path='/add_device' element={
                    <SettingDevice />
                } />

                <Route path='/setting/:device_id' element={
                    <SettingDevice />
                } />

                <Route path='/add_pd_device' element={
                    <SettingPdDevice />
                } />

                <Route path='/setting/:device_id/pd_device' element={
                    <SettingPdDevice />
                } />

                <Route path='/view/:device_id/:camera_id/' element={
                    <ViewKamera />
                } />

                <Route path='add_kamera/:device_id' element={
                    <SettingKamera />
                } />

                <Route path='setting_kamera/:camera_id' element={
                    <SettingKamera />
                } />

                <Route path='chart/:device_id/:camera_id' element={
                    <DataKamera />
                } />


            </Routes>
        </>
    );
}

export default App;
