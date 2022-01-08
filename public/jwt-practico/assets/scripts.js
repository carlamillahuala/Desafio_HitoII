let token;
$("#js-form").on("submit", async function (ev) {
  ev.preventDefault();

  const email = $("#js-input-email").val();
  const password = $("#js-input-password").val();

  //ir a buscar el token
  let jwt = await fetch("http://localhost:3100/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  jwt = await jwt.json();
  token = jwt.token;

  //buscar posteos
  let data = await fetch("http://localhost:3100/api/posts", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  data = await data.json();
  const posts = data.data;

  console.log(posts);
  llenarTabla(posts);
});

function llenarTabla(posts) {
  for (let post of posts) {
    $("#posts-table").append(
      `<tr><td>${post.id}</td><td>${post.title}</td><td>${post.body}</td><td></td></tr>`
    );
  }
  $("#div-form").removeClass("d-block").addClass("d-none");
  $("#div-tabla").removeClass("d-none").addClass("d-block");
}
