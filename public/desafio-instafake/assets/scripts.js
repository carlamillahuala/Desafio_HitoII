let token;
$("#form-login").on("submit", async function (ev) {
  ev.preventDefault();

  const email = $("#email").val();
  const password = $("#password").val();

  //ir a buscar el token
  let jwt = await fetch("http://localhost:3100/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  jwt = await jwt.json();
  token = jwt.token;

  //buscar posteos
  let data = await fetch("http://localhost:3100/api/photos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  data = await data.json();
  const posts = data.data;

  console.log(posts);
  llenarLista(posts);
});

function llenarLista(posts) {
  for (let post of posts) {
    $("#lista-post").append(`
    <div class="col-3">
        <div class="card">
            <img src="${post.download_url}" class="card-img-top" style="height: 230px; object-fit: cover;" />
            <div class="card-body">
            <p class="card-title">Autor: ${post.author}</p>
            </div>
        </div>
    </div>
    `);
  }

  $("#div-form").removeClass("d-block").addClass("d-none");
  $("#lista-post").removeClass("d-none");
}
