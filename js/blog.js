import { formatDateString } from "./global/functions.js";
import { subInputs } from "./global/functions.js";
import { preventSubDefaultReload } from "./global/functions.js";
import { navFilterToggle } from "./global/functions.js";
import { pictureGrabber } from "./global/functions.js";

preventSubDefaultReload();
subInputs();
navFilterToggle();

const baseUrl = "https://codewithspooks.com/insidethetrip/wp-json/wp/v2/posts";
const perPage = "?per_page=";
const perPageNum = 10;
const pageParam = "&page=";
const categoryFilterParam = "?categories=";

const loadMoreUrl = baseUrl + perPage + perPageNum + pageParam;

const loaderInd = document.querySelector(".loader");
const loadMoreCont = document.querySelector(".loadMoreImg");

// CATEGORY FILTER VALIDATOR
const urlParam = new URLSearchParams(window.location.search);
const categoryParam = urlParam.get("categories");
function categoryParamHandler() {
  if (categoryParam) {
    return categoryParam;
  } else {
    return false;
  }
}

// FETCHES THE ARRAY
async function fetchPosts(url) {
  const response = await fetch(url);
  const posts = await response.json();

  return posts;
}

// CREATES AND DISPLAYS POSTS ON WEBSITE
function renderPost(post) {
  loaderInd.style.display = "none";
  const image = post.jetpack_featured_media_url;
  const postTitle = `"` + post.title.rendered + `"`;
  const excerpt = post.excerpt.rendered;
  const date = formatDateString(post.date);

  const blogContainer = document.createElement("a");
  blogContainer.style.cursor = "pointer";
  blogContainer.classList.add("blogListContent");
  blogContainer.href = `/blogSpecific.html?id=${post.id}`;

  const blogImg = document.createElement("img");
  blogImg.src = image;
  const imgAlts = pictureGrabber(post.content.rendered);
  blogImg.alt = imgAlts.imgAlts[0];

  blogContainer.append(blogImg);

  const pContainer = document.createElement("div");
  blogContainer.append(pContainer);

  const descript = document.createElement("p");
  descript.innerHTML = excerpt;

  const title = document.createElement("h3");
  title.style.alignSelf = "end";
  title.style.backgroundColor = "var(--darkBg)";
  title.style.padding = "0px 10px";
  title.style.textTransform = "uppercase";
  title.style.textAlign = "center";
  title.innerText = postTitle + " " + "-" + " " + date;

  const clickMore = document.createElement("p");
  clickMore.innerText = "click to read full story";
  clickMore.style.textAlign = "center";
  clickMore.style.textTransform = "uppercase";
  clickMore.style.fontWeight = "700";
  clickMore.style.marginTop = "auto";
  blogContainer.append(clickMore);

  pContainer.append(title);
  pContainer.append(descript);

  // ADDS LOAD MORE BUTTON TO THE END OF THE BLOG DISPLAY
  loadMoreCont.insertAdjacentElement("beforebegin", blogContainer);
  loadMoreCont.style.display = "flex";
}

// LOOPS THE FETCHED ARRAY AND RUNS FUNCTION TO CREATE POSTS FOR EVERY OBJECT
function renderPosts(posts) {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    renderPost(post);
  }
}

// AWAITS FETCH AND RUNS LOOP FUNCTION. CATEGORY RETURNS TRUE IT WILL FETCH THE BLOGS IN THE GIVEN CATEGORY. IF NO CAT IS PRESENT IT FETCHES THE DEFAULT 10.
async function main() {
  if (categoryParamHandler()) {
    const posts = await fetchPosts(
      baseUrl + categoryFilterParam + categoryParam
    );

    renderPosts(posts);
    loadMoreCont.style.display = "none";
  } else {
    const posts = await fetchPosts(baseUrl);
    renderPosts(posts);
  }
}

main();

// LOADS MORE POSTS ON CLICKS BY ADDING PAGE PARAM TO URL AND REMOVES BUTTON IF PAGE 2 HAS BEEN LOADED.
const loadMoreBtn = document.querySelector("#loadMoreBtn");
let page = 1;

loadMoreBtn.addEventListener("click", async function () {
  page++;

  const response = await fetchPosts(loadMoreUrl + page);
  const post = await response;

  renderPosts(post);

  // CHECKS IF NEXT PAGE OF POSTS HAS BEEN LOADED AND REMOVES THE LOAD MORE BUTTON IF IT HAS. THIS TO PREVENT ERRORS TRYING TO LOAD NON-EXISTING PAGES
  if (page === 2) {
    loadMoreCont.style.display = "none";
    return;
  }
});
