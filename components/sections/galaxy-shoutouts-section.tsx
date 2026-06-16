"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Shoutout } from "@/types/shoutout.types";
import * as THREE from "three";
import ShoutoutModal from "@/components/shared/shoutout-modal";
import ShoutoutCard from "@/components/shared/shoutout-card";

interface ShoutoutsResponse {
  shoutouts: Shoutout[];
  total: number;
  hasMore: boolean;
}

type ShoutoutWithKey = Shoutout & { stableKey: string };

function getStableShoutoutKey(shoutout: Shoutout) {
  return [
    shoutout.id || "",
    shoutout.created_at,
    shoutout.sender_name,
    shoutout.message_type,
    shoutout.media_url || shoutout.youtube_url || shoutout.text_content || "",
  ].join("|");
}

/* ── Galaxy View (interactive canvas-like with positioned nodes) ── */
async function initThree(
  mount: HTMLDivElement,
  width: number,
  height: number,
  shoutouts: ShoutoutWithKey[],
  onSelect: (s: ShoutoutWithKey) => void,
  visible: boolean = true
) {
  const { CSS2DRenderer, CSS2DObject } = await import("three/examples/jsm/renderers/CSS2DRenderer.js");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000008);

  // Camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 150);
  camera.position.set(0, 14, 34);
  camera.lookAt(0, 0, 0);

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
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.6;
  controls.minDistance = 10;
  controls.maxDistance = 60;
  controls.maxPolarAngle = 0.75 * Math.PI;
  controls.update();

  // Particle System (Galaxy Stars)
  const particleCount = typeof width === "number" && width < 768 ? 25000 : 50000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorInside = new THREE.Color(0xff4488);
  const colorOutside = new THREE.Color(3017290); // 0x2e0a4a

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 15 * Math.random();
    const spinAngle = 1.2 * radius;
    const branchAngle = ((i % 4) / 4) * Math.PI * 2;

    const randomVal = Math.pow(Math.random(), 3) * (0.5 > Math.random() ? 1 : -1);
    const y = randomVal * (1 - radius / 15) * 1.5;
    const offset = 0.8 * randomVal;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + offset;
    positions[i3 + 1] = y;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + offset;

    const mixedColor = colorInside.clone().lerp(colorOutside, radius / 15);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.015,
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

  if (visible) {
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
        img.alt = shoutout.sender_name;
        img.className = "galaxy-node-pfp";
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
        shoutout.message_type === "text"
          ? "text"
          : shoutout.message_type === "photo"
          ? "photo"
          : "video";
      nodeDiv.appendChild(typeIcon);

      // Click handler
      nodeDiv.style.pointerEvents = "auto";
      nodeDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect(shoutout);
      });

      const object = new CSS2DObject(nodeDiv);
      object.position.set(x, y, z);
      nodeGroup.add(object);
    });
  }

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    galaxy.rotation.y += 0.0003;
    nodeGroup.rotation.y += 0.0003;
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
  visible = true,
}: {
  shoutouts: ShoutoutWithKey[];
  onSelect: (s: ShoutoutWithKey) => void;
  viewMode: "galaxy" | "normal";
  visible?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!visible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHidden(true);

    timerRef.current = setTimeout(() => {
      setIsHidden(false);
      timerRef.current = setTimeout(() => {
        setIsHidden(true);
      }, 6000);
    }, 10000);
  }, [visible]);

  useEffect(() => {
    // Simple timeout to simulate "galaxy loading"
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible && !loading && viewMode === "galaxy") {
      setIsHidden(false);
      timerRef.current = setTimeout(() => {
        setIsHidden(true);
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, loading, viewMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !visible || loading || viewMode !== "galaxy") return;

    mount.addEventListener("pointermove", resetTimer);
    mount.addEventListener("touchstart", resetTimer);

    return () => {
      mount.removeEventListener("pointermove", resetTimer);
      mount.removeEventListener("touchstart", resetTimer);
    };
  }, [visible, loading, viewMode, resetTimer]);

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
          initThree(mount, width, height, shoutouts, onSelect, visible).then((cb) => {
            cleanup = cb;
          });
        }
      });
      return () => {
        cancelAnimationFrame(raf);
        if (cleanup) cleanup();
      };
    }

    initThree(mount, width, height, shoutouts, onSelect, visible).then((cb) => {
      cleanup = cb;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [shoutouts, viewMode, loading, onSelect, visible]);

  if (shoutouts.length === 0 && visible) {
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
      {visible && !loading && (
        <div className={`galaxy-instructions ${isHidden ? "galaxy-inst-hidden" : ""}`}>
          <span>Drag to rotate</span>
          <span className="galaxy-inst-divider">·</span>
          <span>Pinch to zoom</span>
          <span className="galaxy-inst-divider">·</span>
          <span>Tap a node to open</span>
        </div>
      )}
      {!visible && (
        <div className="galaxy-coming-soon-overlay">
          Shoutouts will be revealed soon
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function GalaxyShoutoutsSection({ visible = true }: { visible?: boolean }) {
  const [view, setView] = useState<"galaxy" | "normal">("galaxy");
  const [shoutouts, setShoutouts] = useState<ShoutoutWithKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ShoutoutWithKey | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all'|'text'|'photo'|'video'>('all');

  // Reset filter when switching view modes
  useEffect(() => {
    setTypeFilter('all');
  }, [view]);

  const fetchShoutouts = useCallback(async (pageNum: number) => {
    if (!visible) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/shoutouts?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ShoutoutsResponse = await res.json();
      const normalized = data.shoutouts.map((shoutout) => ({
        ...shoutout,
        stableKey: getStableShoutoutKey(shoutout),
      }));
      setShoutouts((prev) =>
        pageNum === 1 ? normalized : [...prev, ...normalized]
      );
      setHasMore(data.hasMore);
    } catch {
      // Silent fail — empty state shows
    } finally {
      setLoading(false);
    }
  }, [visible]);

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
            {visible ? "Shoutouts will appear here as stars in the galaxy" : ""}
          </p>
        </div>

        {visible && (
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
        )}

        {view === "normal" && (
          <div className="type-filter-row">
            {(["all", "text", "photo", "video"] as const).map((type) => (
              <button
                key={type}
                className={`type-filter-btn ${typeFilter === type ? "active" : ""}`}
                onClick={() => setTypeFilter(type)}
              >
                {type === "all" ? "All" : type === "text" ? "Text" : type === "photo" ? "Photos" : "Videos"}
              </button>
            ))}
          </div>
        )}

        {!visible ? (
          <GalaxyView shoutouts={[]} onSelect={setSelected} viewMode="galaxy" visible={false} />
        ) : view === "galaxy" ? (
          <GalaxyView shoutouts={shoutouts} onSelect={setSelected} viewMode={view} visible={true} />
        ) : (
          (() => {
            const filtered = typeFilter && typeFilter !== 'all'
              ? shoutouts.filter(s => s.message_type === typeFilter)
              : shoutouts;
            return (
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
                ) : filtered.length === 0 ? (
                  <div className="shoutouts-grid-empty">
                    <div className="shoutouts-grid-empty-icon">💌</div>
                    <p>No {typeFilter} shoutouts yet</p>
                  </div>
                ) : (
                  <>
                    <div className="shoutouts-grid-cards">
                      {filtered.map((s) => (
                        <ShoutoutCard
                          key={s.id || s.stableKey}
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
            );
          })()
        )}
      </section>

      {selected && (
        <ShoutoutModal shoutout={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
