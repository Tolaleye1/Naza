"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Shoutout } from "@/types/shoutout.types";
import Image from "next/image";
import * as THREE from "three";

interface ShoutoutsResponse {
  shoutouts: Shoutout[];
  total: number;
  hasMore: boolean;
}

/* ── Modal for viewing a single shoutout ── */
function ShoutoutModal({
  shoutout,
  onClose,
}: {
  shoutout: Shoutout;
  onClose: () => void;
}) {
  const initial = shoutout.sender_name.charAt(0).toUpperCase();
  const isYouTube = !shoutout.media_url && !!shoutout.youtube_url;

  return (
    <div className="shoutout-modal-overlay" onClick={onClose}>
      <div
        className="shoutout-modal-card glass"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {shoutout.profile_picture_url ? (
          <div className="modal-avatar">
            <Image
              src={shoutout.profile_picture_url}
              alt={shoutout.sender_name}
              width={72}
              height={72}
              className="modal-avatar-img"
            />
          </div>
        ) : (
          <div className="modal-avatar">{initial}</div>
        )}

        <h3 className="modal-sender">{shoutout.sender_name}</h3>
        {shoutout.created_at && (
          <p className="modal-timestamp">
            {new Date(shoutout.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}

        {shoutout.text_content && (
          <p className="modal-message">&ldquo;{shoutout.text_content}&rdquo;</p>
        )}

        {shoutout.media_url && shoutout.message_type === "photo" && (
          <Image
            src={shoutout.media_url}
            alt={`From ${shoutout.sender_name}`}
            width={480}
            height={360}
            className="modal-media-img"
          />
        )}

        {shoutout.media_url && shoutout.message_type === "video" && (
          <video
            src={shoutout.media_url}
            controls
            playsInline
            className="modal-media-video"
          />
        )}

        {isYouTube && shoutout.youtube_url && (
          <div className="modal-youtube-wrap">
            <iframe
              className="modal-youtube"
              src={shoutout.youtube_url.replace("watch?v=", "embed/")}
              title={`Video from ${shoutout.sender_name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="modal-flower">🌸</div>
      </div>
    </div>
  );
}

/* ── Shoutout card for normal grid view ── */
function ShoutoutGridCard({
  shoutout,
  onClick,
}: {
  shoutout: Shoutout;
  onClick: () => void;
}) {
  const initial = shoutout.sender_name.charAt(0).toUpperCase();

  return (
    <div className="glass" style={{ padding: "24px", cursor: "pointer" }} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        {shoutout.profile_picture_url ? (
          <Image
            src={shoutout.profile_picture_url}
            alt={shoutout.sender_name}
            width={40}
            height={40}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="galaxy-node-initial"
            style={{ width: 40, height: 40, fontSize: "1rem" }}
          >
            {initial}
          </div>
        )}
        <div>
          <p style={{ fontFamily: "var(--ff-display)", color: "var(--text-light)", fontSize: "1.1rem", fontWeight: 400 }}>
            {shoutout.sender_name}
          </p>
          {shoutout.created_at && (
            <p style={{ fontFamily: "var(--ff-body)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {new Date(shoutout.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </p>
          )}
        </div>
      </div>

      {shoutout.text_content && (
        <p
          className="line-clamp-3"
          style={{
            fontFamily: "var(--ff-body)",
            color: "var(--text-light)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          &ldquo;{shoutout.text_content}&rdquo;
        </p>
      )}

      {shoutout.media_url && shoutout.message_type === "photo" && (
        <Image
          src={shoutout.media_url}
          alt={`From ${shoutout.sender_name}`}
          width={400}
          height={220}
          style={{ borderRadius: 12, width: "100%", height: "auto", marginTop: 8, objectFit: "cover" }}
        />
      )}
    </div>
  );
}

/* ── Galaxy View (interactive canvas-like with positioned nodes) ── */
async function initThree(
  mount: HTMLDivElement,
  width: number,
  height: number,
  shoutouts: Shoutout[],
  onSelect: (s: Shoutout) => void
) {
  const { CSS2DRenderer, CSS2DObject } = await import("three/examples/jsm/renderers/CSS2DRenderer.js");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(0, 8, 12);

  // WebGL renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.appendChild(renderer.domElement);

  // CSS2D renderer — overlay on top
  const css2dRenderer = new CSS2DRenderer();
  css2dRenderer.setSize(width, height);
  css2dRenderer.domElement.style.position = "absolute";
  css2dRenderer.domElement.style.top = "0";
  css2dRenderer.domElement.style.left = "0";
  css2dRenderer.domElement.style.width = "100%";
  css2dRenderer.domElement.style.height = "100%";
  css2dRenderer.domElement.style.pointerEvents = "none";
  css2dRenderer.domElement.style.overflow = "hidden";
  mount.appendChild(css2dRenderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 25;
  controls.minDistance = 2;

  // Particle System (Galaxy Stars)
  const particleCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = Math.random() * 8 + 0.5;
    const spinAngle = radius * 1.2;
    const armIndex = i % 4;
    const branchAngle = (armIndex / 4) * Math.PI * 2;

    const randomX = (Math.random() - 0.5) * 0.3 * (8 - radius) / 8;
    const randomY = (Math.random() - 0.5) * 0.2 * (8 - radius) / 8;
    const randomZ = (Math.random() - 0.5) * 0.3 * (8 - radius) / 8;

    const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
    const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    const y = randomY;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Mixed colors (pink to purple)
    const mixedColor = new THREE.Color();
    const colorRatio = Math.random();
    mixedColor.lerpColors(
      new THREE.Color("#e8698a"), // Pink
      new THREE.Color("#7e22ce"), // Purple
      colorRatio
    );

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const galaxy = new THREE.Points(geometry, material);
  scene.add(galaxy);

  // Node Group
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);

  // Position Shoutouts
  const START_RADIUS = 2.5;
  const STEP_RADIUS = 2.2;

  shoutouts.forEach((shoutout, index) => {
    const armIndex = index % 4;
    const round = Math.floor(index / 4);
    const radius = START_RADIUS + (round * STEP_RADIUS);
    const branchAngle = (armIndex / 4) * Math.PI * 2;
    const spinAngle = radius * 1.2;

    const x = Math.cos(branchAngle + spinAngle) * radius;
    const z = Math.sin(branchAngle + spinAngle) * radius;
    const y = 0; // no vertical scatter

    // Create DOM element for node
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "galaxy-node";
    nodeDiv.setAttribute("data-type", shoutout.message_type);

    // Profile picture support
    const initial = document.createElement("div");
    initial.className = "galaxy-node-initial";

    if (shoutout.profile_picture_url) {
      const img = document.createElement("img");
      img.src = shoutout.profile_picture_url;
      img.className = "galaxy-node-img";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;";
      initial.appendChild(img);
    } else {
      initial.textContent = shoutout.sender_name[0].toUpperCase();
    }
    nodeDiv.appendChild(initial);

    const nameSpan = document.createElement("span");
    nameSpan.className = "galaxy-node-name";
    nameSpan.textContent = shoutout.sender_name;
    nodeDiv.appendChild(nameSpan);

    const typeIcon = document.createElement("span");
    typeIcon.className = "galaxy-node-icon";
    typeIcon.textContent =
      shoutout.message_type === "photo" ? "📷" : shoutout.message_type === "video" ? "🎥" : "✍️";
    nodeDiv.appendChild(typeIcon);

    // Click handler
    nodeDiv.addEventListener("click", () => {
      onSelect(shoutout);
    });

    const object = new CSS2DObject(nodeDiv);
    object.position.set(x, y, z);
    nodeGroup.add(object);
  });

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    galaxy.rotation.y += 0.0008;
    nodeGroup.rotation.y += 0.0008;
    controls.update();
    renderer.render(scene, camera);
    css2dRenderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    css2dRenderer.setSize(w, h);
  };
  window.addEventListener("resize", handleResize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", handleResize);
    controls.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    if (mount.contains(css2dRenderer.domElement)) mount.removeChild(css2dRenderer.domElement);
  };
}

function GalaxyView({
  shoutouts,
  onSelect,
  viewMode,
}: {
  shoutouts: Shoutout[];
  onSelect: (s: Shoutout) => void;
  viewMode: "galaxy" | "normal";
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple timeout to simulate "galaxy loading"
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (viewMode !== "galaxy") return;
    if (!mountRef.current || loading) return;

    const mount = mountRef.current;

    // Wait for the element to have real dimensions
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    let cleanup: (() => void) | undefined;

    if (width === 0 || height === 0) {
      // Element not yet painted — wait one frame
      const raf = requestAnimationFrame(() => {
        width = mount.clientWidth;
        height = mount.clientHeight;
        if (width > 0 && height > 0) {
          initThree(mount, width, height, shoutouts, onSelect).then((cb) => {
            cleanup = cb;
          });
        }
      });
      return () => {
        cancelAnimationFrame(raf);
        if (cleanup) cleanup();
      };
    }

    initThree(mount, width, height, shoutouts, onSelect).then((cb) => {
      cleanup = cb;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [shoutouts, viewMode, loading, onSelect]);

  if (shoutouts.length === 0) {
    return (
      <div className="galaxy-canvas-wrap">
        <div className="galaxy-loading">
          <p>No shoutouts yet — be the first star ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="galaxy-canvas-wrap">
      {loading && (
        <div className="galaxy-loading">
          <div className="galaxy-loading-spinner" />
          <p>Loading the galaxy...</p>
        </div>
      )}
      <div
        ref={mountRef}
        className="galaxy-mount"
        style={{ position: "relative", width: "100%", height: "100%" }}
      />
    </div>
  );
}

/* ── Main Component ── */
export default function GalaxyShoutoutsSection() {
  const [view, setView] = useState<"galaxy" | "normal">("galaxy");
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Shoutout | null>(null);

  const fetchShoutouts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shoutouts?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ShoutoutsResponse = await res.json();
      setShoutouts((prev) =>
        pageNum === 1 ? data.shoutouts : [...prev, ...data.shoutouts]
      );
      setHasMore(data.hasMore);
    } catch {
      // Silent fail — empty state shows
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShoutouts(1);
  }, [fetchShoutouts]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchShoutouts(next);
  }

  return (
    <>
      <section id="galaxy-shoutouts">
        <div className="section-inner">
          <p className="section-eyebrow">in the stars</p>
          <h2 className="section-title">
            Shoutouts
            <br />
            <em>for Naza</em>
          </h2>
          <p className="galaxy-hint">
            Shoutouts will appear here as stars in the galaxy
          </p>
        </div>

        <div className="view-toggle-wrap">
          <button
            className={`view-toggle-btn ${view === "galaxy" ? "active" : ""}`}
            onClick={() => setView("galaxy")}
          >
            Galaxy View
          </button>
          <button
            className={`view-toggle-btn ${view === "normal" ? "active" : ""}`}
            onClick={() => setView("normal")}
          >
            Normal View
          </button>
        </div>

        {view === "galaxy" ? (
          <GalaxyView shoutouts={shoutouts} onSelect={setSelected} viewMode={view} />
        ) : (
          <div className="shoutouts-normal-wrap">
            {loading && shoutouts.length === 0 ? (
              <div className="shoutouts-grid-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-card glass" />
                ))}
              </div>
            ) : shoutouts.length === 0 ? (
              <div className="shoutouts-grid-empty">
                <div className="shoutouts-grid-empty-icon">💌</div>
                <p>No shoutouts yet — be the first!</p>
              </div>
            ) : (
              <>
                <div className="shoutouts-grid-cards">
                  {shoutouts.map((s, i) => (
                    <ShoutoutGridCard
                      key={s.id || i}
                      shoutout={s}
                      onClick={() => setSelected(s)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="shoutouts-grid-loadmore">
                    <button
                      className="shoutouts-grid-loadmore-btn"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {selected && (
        <ShoutoutModal shoutout={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
