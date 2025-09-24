function(instance, properties, context) {
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
                background-color: ${properties.handle_color_unchecked};
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
                background-color: ${properties.handle_color_checked};
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
        
        // Set initial checked state based on properties.switch_state
        let initialChecked = false;
        if (properties.switch_state === 'Checked') {
            initialChecked = true;
        } else if (properties.switch_state === 'Unchecked') {
            initialChecked = false;
        } else if (properties.switch_state === 'Data Source') {
            initialChecked = properties.data_source;
        }

        toggleLabel.innerHTML = `
          <input type="checkbox" id="${uniqueId}-input" style="display: none;" ${initialChecked ? 'checked' : ''}>
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
        instance.data.toggleCheck = toggleCheck;

        // Publish the initial state when the plugin loads if not in 'State' or 'Data Source' mode
        if (properties.switch_state !== 'State' && properties.switch_state !== 'Data Source') {
            instance.publishState('checked', toggleCheck.checked);
            instance.publishAutobinding(toggleCheck.checked);
        }

        // Bind the event listener to the selected element
        (properties.toggle_type === 'Rounded' ? toggleLabelRounded : toggleLabelRectangular).addEventListener('click', function() {
            // Trigger the click event
            instance.triggerEvent('clicked');

            // Only toggle manually if not in 'State' or 'Data Source' mode
            if (properties.switch_state !== 'State' && properties.switch_state !== 'Data Source') {
                // Manually toggle the checkbox's checked state
                toggleCheck.checked = !toggleCheck.checked;

                // Update handle color based on checked state
                const handleColor = toggleCheck.checked ? properties.handle_color_checked : properties.handle_color_unchecked;
                toggleCheck.nextElementSibling.style.setProperty('--slider-before-bg', handleColor);

                // Trigger the same events as before
                instance.publishState('checked', toggleCheck.checked);
                instance.publishAutobinding(toggleCheck.checked);
                instance.triggerEvent('changed');
            }
        });

        // Function to update the toggle state based on property.checked
        instance.data.updateToggleState = function(checked) {
            toggleCheck.checked = checked;
            const handleColor = checked ? properties.handle_color_checked : properties.handle_color_unchecked;
            toggleCheck.nextElementSibling.style.setProperty('--slider-before-bg', handleColor);
            instance.publishState('checked', checked);
            instance.publishAutobinding(checked);
            instance.triggerEvent('changed');
        };

        // Function to update the toggle state based on data_source
        instance.data.updateDataSourceState = function() {
            if (properties.switch_state === 'Data Source') {
                const checked = properties.data_source;
                toggleCheck.checked = checked;
                const handleColor = checked ? properties.handle_color_checked : properties.handle_color_unchecked;
                toggleCheck.nextElementSibling.style.setProperty('--slider-before-bg', handleColor);
                instance.publishState('checked', checked);
                instance.publishAutobinding(checked);
                instance.triggerEvent('changed');
            }
        };

        // Initial call to set state based on data source
        if (properties.switch_state == 'Data Source') {
            instance.data.updateDataSourceState();
        }

        instance.data.isRun = true;
    }

    // Update the state when properties.data_source changes and switch_state is 'Data Source'
    instance.update = function(properties, context) {
        if (properties.switch_state == 'Data Source') {
            instance.data.updateDataSourceState();
        }
    };
}