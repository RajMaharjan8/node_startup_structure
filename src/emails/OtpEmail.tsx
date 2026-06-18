interface OtpEmailInterface {
  otp: string;
}

export default function OtpEmail({ otp }: OtpEmailInterface) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", margin: 0 }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px", backgroundColor: "#ffffff" }}>
          <h1 style={{ fontSize: "20px" }}>Verify your email</h1>
          <p>Use the code below to verify your account. It expires in 10 minutes.</p>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              letterSpacing: "4px",
              textAlign: "center",
              padding: "16px",
            }}
          >
            {otp}
          </div>
          <p>If you didn&apos;t request this, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  );
}
