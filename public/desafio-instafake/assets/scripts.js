init();
async function init() {
  const token = localStorage.getItem("token");
  if (token) {
    const posts = await getPosts(token, 1);
    llenarCard(posts);
    ocultarLogin();
  }
}

$("#logout").on("click", function (ev) {
  logout();
});

$("#form-login").on("submit", async function (ev) {
  ev.preventDefault();

  try {
    const email = $("#email").val();
    const password = $("#password").val();

    $("#login-error").addClass("d-none").empty();
    const token = await getToken(email, password);
    const posts = await getPosts(token, 1);
    llenarCard(posts);
    ocultarLogin();
  } catch (err) {
    $("#login-error").removeClass("d-none").html(err.message);
  }
});

let pagActual = 1;

$("#morePages").on("click", async function (ev) {
  ev.preventDefault();
  const token = localStorage.getItem("token");
  pagActual += 1;
  let newPosts = await getPosts(token, pagActual);
  llenarCard(newPosts);
});

function logout() {
  localStorage.removeItem("token");
  pagActual = 1;
  $("#lista-post").empty();
  $("#navbar").removeClass("d-block").addClass("d-none");
  $("#div-form").removeClass("d-none").addClass("d-block");
  $("#contenido").addClass("d-none");
}

//ir a buscar el token
async function getToken(email, password) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (res.status >= 400) {
    throw new Error(json.message);
  } else {
    token = json.token;
    localStorage.setItem("token", token);
    return token;
  }
}

//buscar posteos
async function getPosts(token, page) {
  let data = await fetch(`/api/photos?page=${page}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  data = await data.json();
  const posts = data.data;
  return posts;
}

function llenarCard(posts) {
  for (let post of posts) {
    $("#lista-post").append(`
    <div class="col-6 offset-3 pb-3">
        <div class="card">
            <img src="${post.download_url}" class="card-img-top" style="height: 400px; object-fit: cover;" />
            <div class="card-body">
            <p class="card-title">Autor: ${post.author}</p>
            </div>
        </div>
    </div>
    `);
  }
}

function ocultarLogin() {
  $("#div-form").removeClass("d-block").addClass("d-none");
  $("#contenido").removeClass("d-none");
  $("#navbar").removeClass("d-none").addClass("d-block");
}
