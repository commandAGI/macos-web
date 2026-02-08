import { mount } from 'svelte';
import Desktop from './components/Desktop/Desktop.svelte';
import './css/global.css';
import { initEmbedBridge } from './lib/embed-bridge';

const desktop = mount(Desktop, {
	target: document.getElementById('root'),
});

initEmbedBridge();

export default desktop;
