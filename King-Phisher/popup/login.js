document.getElementById("loginForm").addEventListener("submit", async (e) => {
	e.preventDefault();

	const email = document.getElementById("loginEmail").value.trim();
	const password = document.getElementById("loginPassword").value;

	if (!email || !password) {
		alert("Please enter both email and password.");
		return;
	}

	try {
		// Optionally show a loading spinner here
		const res = await fetch("http://localhost:8000/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await res.json();

		if (res.ok) {
			localStorage.setItem("user", JSON.stringify(data.user));
			window.location.href = "popup.html";
		} else {
			alert(
				data.message || "Login failed. Please check your credentials."
			);
		}
	} catch (error) {
		alert("An error occurred while trying to log in. Please try again.");
		console.error("Login error:", error);
	}
});
