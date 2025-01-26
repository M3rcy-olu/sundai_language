"use client";
import Image from "next/image";
// import { useRouter } from "next/router";
import { redirect } from "next/navigation";

export default function Home() {
  // const router = useRouter();
  

  return (
    <main className="home-screen">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">Tongue</h1>
      </nav>

      {/* Main Content */}
      <div className="frame-2">
        <div className="frame-1">
          <div className="headers">
            <h2 className="title">
              <span className="gradient">Speak </span>
              Language. Don't just "Learn".
            </h2>

            <div className="subtext">
              <p>
                With <span className="gradient">Tongue</span>
                <span>, learning a new "tongue" has never been easier.</span>
              </p>
              <br />
              <p>
                Learn your new <span className="gradient">Tongue </span>
                <span>(Spanish) now.</span>
              </p>
            </div>
          </div>
        </div>
        <div className="ai">
          <div className="circle"></div>
          <p>Hola, como estas?</p>
        </div>
      </div>
      <button className="speak-button" onClick={() => {redirect("/chat")}}>
        <span className="scenario">Speak Now</span>
      </button>
    </main>
  );
}
