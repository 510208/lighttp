export function fetchContributors() {
  return fetch("https://api.github.com/repos/510208/lighttp/contributors").then(
    (response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  );
}
