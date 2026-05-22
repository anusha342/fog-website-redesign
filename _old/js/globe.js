// ════════════════════════════════════════════
//  amCharts 5 — GLOBE (orthographic)
// ════════════════════════════════════════════
try {
  // Create root element
  var root = am5.Root.new("chartdiv");

  // Set themes
  root.setThemes([
    am5themes_Animated.new(root)
  ]);

  // Create the map chart with orthographic projection (globe shape)
  var chart = root.container.children.push(am5map.MapChart.new(root, {
    panX: "rotateX",
    panY: "rotateY",
    projection: am5map.geoOrthographic(),
    paddingBottom: 20,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    // Disable zoom in/out (mouse wheel and pinch)
    wheelY: "none",
    wheelX: "none",
    pinchZoom: false
  }));

  // Create main polygon series for countries — white land fill
  var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    geoJSON: am5geodata_worldLow
  }));

  polygonSeries.mapPolygons.template.setAll({
    fill: am5.color(0xFFFFFF),
    fillOpacity: 0.9,
    stroke: am5.color(0x131313),
    strokeWidth: 0.3,
    tooltipText: "{name}",
    toggleKey: "active",
    interactive: true
  });

  polygonSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(0xF05023),
    fillOpacity: 0.85
  });

  // Create series for background fill — dark grey sea matching website dark theme
  var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
  backgroundSeries.mapPolygons.template.setAll({
    fill: root.interfaceColors.get("alternativeBackground"),
    fillOpacity: 0.1,
    strokeOpacity: 0
  });
  backgroundSeries.data.push({
    geometry: am5map.getGeoRectangle(90, 180, -90, -180)
  });

  // Create graticule series (grid overlay)
  var graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
  graticuleSeries.mapLines.template.setAll({
    strokeOpacity: 0.1,
    stroke: root.interfaceColors.get("alternativeBackground")
  });

  // ── Orange location markers (matching original Three.js dots) ──
  var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
  pointSeries.bullets.push(function() {
    var circle = am5.Circle.new(root, {
      radius: 6,
      fill: am5.color(0xF05023),
      strokeOpacity: 0,
      tooltipText: "{title}"
    });

    // Pulse animation on each dot
    circle.animate({
      key: "radius",
      from: 6,
      to: 12,
      duration: 1200,
      easing: am5.ease.out(am5.ease.cubic),
      loops: Infinity,
      alternating: true
    });

    circle.animate({
      key: "opacity",
      from: 1,
      to: 0.3,
      duration: 1200,
      easing: am5.ease.out(am5.ease.cubic),
      loops: Infinity,
      alternating: true
    });

    return am5.Bullet.new(root, { sprite: circle });
  });

  var locations = [
    { title: "India",        latitude: 20.5,   longitude: 78.9  },
    { title: "Bangalore",    latitude: 12.9,   longitude: 77.5  },
    { title: "Mumbai",       latitude: 19.0,   longitude: 72.8  },
    { title: "Delhi",        latitude: 28.6,   longitude: 77.2  },
    { title: "Hyderabad",    latitude: 17.3,   longitude: 78.4  },
    { title: "Sydney",       latitude: -33.8,  longitude: 151.2 },
    { title: "Melbourne",    latitude: -37.8,  longitude: 144.9 },
    { title: "Singapore",    latitude: 1.35,   longitude: 103.8 },
    { title: "Dubai",        latitude: 25.2,   longitude: 55.2  },
    { title: "London",       latitude: 51.5,   longitude: -0.1  }
  ];

  pointSeries.data.setAll(locations);

  // ── Auto-rotation with pause/resume ──
  // Store animation reference so we can stop + restart from current position
  var rotationAnimation = null;

  function startRotation() {
    var currentX = chart.get("rotationX") || 0;
    if (rotationAnimation) {
      rotationAnimation.stop();
    }
    rotationAnimation = chart.animate({
      key: "rotationX",
      from: currentX,
      to: currentX + 360,
      duration: 30000,
      loops: Infinity
    });
  }

  // Begin auto-rotation immediately
  startRotation();

  var chartDiv = document.getElementById("chartdiv");

  // Pause while cursor is over the globe
  chartDiv.addEventListener("mouseenter", function() {
    if (rotationAnimation) {
      rotationAnimation.pause();
    }
  });

  // When cursor leaves, restart auto-rotation from wherever the globe stopped
  chartDiv.addEventListener("mouseleave", function() {
    startRotation();
  });

  // Make stuff animate on load
  chart.appear(1000, 100);
} catch(e) {
  console.log(e);
}
