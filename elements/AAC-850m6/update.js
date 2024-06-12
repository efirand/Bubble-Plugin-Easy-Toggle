function(instance, properties, context) {
    // Function to set the switch dimensions and calculate proportions
    function setSwitchDimensions(idPrefix) {
        const switchWidth = properties.bubble.width();
        const switchHeight = properties.bubble.height();
        
        // Calculate initial handle size and transform distance
        let handleSize = switchHeight - 8; // Example calculation: height minus some padding
        const transformX = switchWidth - switchHeight; // Example calculation

        const uniqueId = `${idPrefix}-${Math.random().toString(16).slice(2, 10)}`;

        // If show_border is true, adjust handle size and set border properties
        let borderStyle = '';
        if (properties.show_border) {
            const borderWidth = 2;
            const borderColor = properties.border_color;
            borderStyle = `border: ${borderWidth}px solid ${borderColor};`;
            handleSize -= (borderWidth * 2) - 1; // Decrease handle size to compensate for the border width
        }

        // Create a style block with unique CSS rules for the element
        const style = document.createElement('style');
        style.innerHTML = `
            #${uniqueId} {
                width: ${switchWidth}px;
                height: ${switchHeight}px;
                position: relative;
                display: inline-block;
            }
            #${uniqueId} .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: ${properties.main_color_unchecked};
                ${borderStyle}
                -webkit-transition: .4s;
                transition: .4s;
            }
            #${uniqueId} .slider:before {
                position: absolute;
                content: "";
                height: ${handleSize}px;
                width: ${handleSize}px;
                left: 4px;
                bottom: 4px;
                background-color: ${properties.handle_color};
                -webkit-transition: .4s;
                transition: .4s;
            }
            #${uniqueId} input:checked + .slider {
                background-color: ${properties.main_color_checked};
            }
            #${uniqueId} input:focus + .slider {
                box-shadow: 0 0 1px ${properties.main_focus_color};
            }
            #${uniqueId} input:checked + .slider:before {
                -webkit-transform: translateX(${transformX}px);
                -ms-transform: translateX(${transformX}px);
                transform: translateX(${transformX}px);
            }
            #${uniqueId} .slider.round {
                border-radius: 34px;
            }
            #${uniqueId} .slider.round:before {
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);

        return uniqueId;
    }

    // Create the toggle element
    function createToggleElement(uniqueId, toggleType) {
        const toggleLabel = document.createElement('label');
        toggleLabel.classList.add('switch');
        toggleLabel.id = uniqueId;
        toggleLabel.innerHTML = `
          <input type="checkbox" id="${uniqueId}-input" style="display: none;">
          <span class="slider ${toggleType}"></span>
        `;
        return toggleLabel;
    }

    // Ensure each element gets its own style
    if (!instance.data.isRun) {
        const uniqueIdRounded = setSwitchDimensions('rounded');
        const uniqueIdRectangular = setSwitchDimensions('rectangular');

        const toggleLabelRounded = createToggleElement(uniqueIdRounded, 'round');
        const toggleLabelRectangular = createToggleElement(uniqueIdRectangular, '');

        if (properties.toggle_type === 'Rounded') {
            instance.canvas.append(toggleLabelRounded);
        } else {
            instance.canvas.append(toggleLabelRectangular);
        }

        const toggleCheck = document.getElementById(`${properties.toggle_type === 'Rounded' ? uniqueIdRounded : uniqueIdRectangular}-input`);

        // Bind the event listener to the selected element
        (properties.toggle_type === 'Rounded' ? toggleLabelRounded : toggleLabelRectangular).addEventListener('click', function() {
            // Manually toggle the checkbox's checked state
            toggleCheck.checked = !toggleCheck.checked;

            // Trigger the same events as before
            instance.publishState('checked', toggleCheck.checked);
            instance.publishAutobinding(toggleCheck.checked);
            instance.triggerEvent('changed');
        });
    }

    instance.data.isRun = true;
}
