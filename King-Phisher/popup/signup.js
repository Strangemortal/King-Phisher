document.getElementById("signupForm").addEventListener("submit", async (e) => {
	e.preventDefault();

	const name = document.getElementById("signupName").value;
	const email = document.getElementById("signupEmail").value;
	const password = document.getElementById("signupPassword").value;

	if (!email || !password) {
		alert("Please enter both email and password.");
		return;
	}

	try {
		const response = await fetch("http://localhost:8000/api/auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, email, password }),
		});

		const data = await response.json();

		if (response.ok) {
			alert("Signup successful! Redirecting to login...");
			window.location.href = "login.html";
		} else {
			alert(data.message || "Signup failed.");
		}
	} catch (error) {
		alert("An error occurred during signup. Please try again.");
		console.error("Signup error:", error);
	}
});
