let currentTab = 'login';

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('loginTab').classList.remove('active_tab');
  document.getElementById('registerTab').classList.remove('active_tab');
  document.getElementById(`${tab}Tab`).classList.add('active_tab');

  document.getElementById('loginTabContent').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerTabContent').style.display = tab === 'register' ? 'block' : 'none';
}

async function login(event) {
  event.preventDefault();

  try {
    const response = await axios.post('http://localhost:8000/api/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value,
    });
    // console.log(response);
  } catch (error) {
    console.error(error);
    document.getElementById('errorDisplay').innerText = error.response.data.message;
  }
}

async function register(event) {
  event.preventDefault();

  try {
    const response = await axios.post('http://localhost:8000/api/register', {
      username: document.getElementById('registerUsername').value,
      email: document.getElementById('registerEmail').value,
      password: document.getElementById('registerPassword').value,
    });
    console.log(response);
  } catch (error) {
    console.error(error);
    document.getElementById('errorDisplay').innerText = error.response.data.message;
  }
}

async function googleAuth() {
  try {
    const response = await axios.get('/api/google');
    console.log(response);
  } catch (error) {
    console.error(error);
    document.getElementById('errorDisplay').innerText = error.message;
  }
}
